const isDecimal = number =>
  typeof number !== 'string' && number.toString().indexOf('.') !== -1;
export default isDecimal;
