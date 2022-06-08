import { always, cond, equals} from 'ramda';

const ops = {
    ADD: "+",
    SUB: "-",
    MUL: "*",
    DIV: "/",
    GT: ">",
    LT: "<",
    GTE: ">=",
    LTE: "<=",
    EQ: "==",
    EEQ: "==="
};
let globalScope = new Map();
let value;

const visitVariableDeclaration = (node) => {
    const nodeKind = node.kind;
    return visitNodes(node.declarations, nodeKind);
}

const visitVariableDeclarator = (node, nodeKind) => {
    const id = node.id && node.id.name;
    const init = visitNode(node.init);
    if (nodeKind === "let" || nodeKind === "const" || nodeKind === "var") {
      if (globalScope.has(id)) {
        value = `Uncaught SyntaxError: Identifier '${id}' has already been declared`;
      } else {
        globalScope.set(id, init);
      }
    } else {
      globalScope.set(id, init);
    }

    return init;
}
  
const visitLiteral = (node) => {
    return node.raw;
}

const visitIdentifier = (node) => {
    const name = node.name;
    return globalScope.get(name)
        ? globalScope.get(name)
        : (value = ` Uncaught ReferenceError: '${name}' is not defined `);
}

const visitBinaryExpression = (node) => {
    const leftNode = isNaN(visitNode(node.left))
        ? visitNode(node.left)
        : +visitNode(node.left);
    const operator = node.operator;
    const rightNode = isNaN(visitNode(node.right))
        ? visitNode(node.right)
        : +visitNode(node.right);
    const result = cond([
        [equals(ops.ADD), always(leftNode + rightNode)],
        [equals(ops.SUB), always(leftNode - rightNode)],
        [equals(ops.DIV), always(leftNode / rightNode)],
        [equals(ops.MUL), always(leftNode * rightNode)],
        [equals(ops.GT), always(leftNode > rightNode)],
        [equals(ops.LT), always(leftNode < rightNode)],
        [equals(ops.LTE), always(leftNode <= rightNode)],
        [equals(ops.GTE), always(leftNode >= rightNode)],
        [equals(ops.EQ), always(leftNode == rightNode)],
        [equals(ops.EEQ), always(leftNode === rightNode)]
    ]);
    return result(operator);
}

const evalArgs = (nodeArgs) => {
    let g = [];
    for (const nodeArg of nodeArgs) {
      g.push(visitNode(nodeArg));
    }
    return g;
}

const visitCallExpression = (node) => {
    const _arguments = evalArgs(node.arguments);
    value = _arguments;
    if (node.callee.type == "MemberExpression") {
      const callee = node.callee;
      if (node.callee.property.name == "log") {
        return value;
      }
    }
    if (node.callee.type == "Identifier" && node.callee.name == "alert") {
      alert(value);
      return value;
    }
}

const visitExpressionStatement = (node) => {
    return visitCallExpression(node.expression);
}

const visitNodes = (nodes, nodeKind = "") => {
    for (const node of nodes) {
        const nodeType = node.type;
        visitNode(node, nodeKind);
    }
}

const visitNode = cond([
    [(node) => node.type =='VariableDeclaration', (node) => visitVariableDeclaration(node)],
    [(node) => node.type =='VariableDeclarator', (node, nodeKind) =>visitVariableDeclarator(node, nodeKind)],
    [(node) => node.type =='Literal', (node) =>visitLiteral(node)],
    [(node) => node.type =='Identifier', (node) =>visitIdentifier(node)],
    [(node) => node.type =='BinaryExpression', (node) =>visitBinaryExpression(node)],
    [(node) => node.type =='CallExpression', (node) =>visitCallExpression(node)],
    [(node) => node.type =='ExpressionStatement', (node) =>visitExpressionStatement(node)],
    [always(true), always(null)]
]);

export function getValue() {
    return value;
}


export const run = (nodes) => {
    value="";
    return visitNodes(nodes);
}

  