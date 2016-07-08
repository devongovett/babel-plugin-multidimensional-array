import {plugins} from 'babylon/lib/parser';
import {types as tt} from "babylon/lib/tokenizer/types";

// babylon parser plugin
plugins.arrayDimensions = function(instance) {
  instance.extend('parseVarHead', parseDimensions);
  instance.extend('parseAssignableListItemTypes', parseDimensions);
};

function parseDimensions(inner) {
  return function(decl) {
    inner.call(this, decl);
    
    // parse array dimensions
    while (this.eat(tt.bracketL)) {
      let expr = this.parseExpression();
      
      if (!decl.dimensions) {
        decl.dimensions = [];
      }
      
      decl.dimensions.push(expr);
      this.expect(tt.bracketR);
    }
  };
}

export default function({types: t, traverse: {NodePath}}) {
  return {
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("arrayDimensions");
    },
    
    visitor: {
      MemberExpression(path) {
        let node = path.node;
        if (!node.computed || node.multiArray) {
          return;
        }
        
        // Go down the chain of member expressions until the end
        let vals = [];
        while (node.type === 'MemberExpression') {
          vals.unshift(node.property);
          node = node.object;
        }
        
        // If we hit an identifier, try to find it in the scope, and get the dimensions
        if (node.type === 'Identifier') {
          let binding = path.scope.getBinding(node.name);
          let dimensions = binding && binding.path.node.dimensions;
          if (!dimensions || dimensions.length < 2) {
            return;
          }
          
          // Compute an expression for the array offset
          let expr = getOffset(dimensions, vals, path);
          
          // If we got a fully specified path for all dimensions, replace
          // with a member expression, otherwise create a subarray.
          if (vals.length === dimensions.length) {
            expr = t.memberExpression(node, expr, true);
            expr.multiArray = true;
          } else if (vals.length < dimensions.length) {
            // Get the end offset of the subarray by adding 1 to the last dimension specified
            vals[vals.length - 1] = t.binaryExpression('+', vals[vals.length - 1], t.numericLiteral(1));
            let end = getOffset(dimensions, vals, path);
            expr = t.callExpression(t.memberExpression(node, t.identifier('subarray')), [expr, end]);
          } else {
            throw new Error('Too many dimensions specified. Got ' + vals.length + ', expected ' + dimensions.length + '.');
          }
          
          path.replaceWith(expr);
        }
      }
    }
  };
  
  function getOffset(dimensions, vals, parent) {
    // Compute the offset in row-major order
    let expr = vals[0];
    for (let i = 1; i < dimensions.length; i++) {
      expr = t.binaryExpression('*', dimensions[i], expr);
      if (vals[i]) {
        expr = t.binaryExpression('+', vals[i], expr);
      }
    }
    
    // Evaluate the expression and get a literal if possible
    let container = { node: expr };
    let path = NodePath.get({
      parentPath: parent,
      parent: container,
      container: container,
      key: 'node'
    }).setContext(parent.context);
    
    let res = path.evaluate();
    if (res.confident && typeof res.value === 'number' && !isNaN(res.value)) {
      return t.numericLiteral(res.value);
    }
    
    return expr;
  }
};
