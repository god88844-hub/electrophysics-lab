// A separately written behavioral spec for independent functional checking.
// The reference uses a mux/concatenation formulation rather than alu8's
// procedural case statement, so differences trigger Yosys equivalence failure.
module alu8_spec(
  input wire [7:0] a,
  input wire [7:0] b,
  input wire [1:0] op,
  output wire [7:0] y,
  output wire carry,
  output wire zero
);
  wire [8:0] addition = {1'b0, a} + {1'b0, b};
  wire add_en = op == 2'd0;
  wire xor_en = op == 2'd1;
  wire and_en = op == 2'd2;
  wire shift_en = op == 2'd3;

  assign y = ({8{add_en}} & addition[7:0])
           | ({8{xor_en}} & (a ^ b))
           | ({8{and_en}} & (a & b))
           | ({8{shift_en}} & {a[6:0], b[0]});
  assign carry = (add_en & addition[8]) | (shift_en & a[7]);
  assign zero = (y == 8'h00);
endmodule
