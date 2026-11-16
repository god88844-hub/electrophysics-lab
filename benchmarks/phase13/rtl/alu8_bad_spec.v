// Deliberately incorrect *negative control*: replaces XOR with OR.
// Equivalence check MUST FAIL for this module, or the gate cannot pass.
module alu8_bad_spec (
  input wire [7:0] a,
  input wire [7:0] b,
  input wire [1:0] op,
  output wire [7:0] y,
  output wire carry,
  output wire zero
);
  wire [8:0] sum = {1'b0,a}+{1'b0,b};
  assign y = op == 2'd0 ? sum[7:0] :
             op == 2'd1 ? (a | b) :  // INTENTIONAL BUG
             op == 2'd2 ? (a & b) :
                          {a[6:0],b[0]};
  assign carry = op==2'd0 ? sum[8] : (op==2'd3 ? a[7] : 1'b0);
  assign zero = ~|y;
endmodule
