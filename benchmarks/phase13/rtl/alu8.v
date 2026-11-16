// Invention Lab Phase 13: a *real synthesizable* 8-bit combinational ALU.
// Small bounded RTL demonstration for open SKY130 standard-cell mapping.
// Not a completed CPU, not a fabricated chip, and not timing signoff.
module alu8 (
  input wire [7:0] a,
  input wire [7:0] b,
  input wire [1:0] op,
  output reg [7:0] y,
  output reg carry,
  output wire zero
);
  reg [8:0] sum;
  always @* begin
    sum = {1'b0,a} + {1'b0,b};
    y = 8'h00;
    carry = 1'b0;
    case (op)
      2'b00: begin y = sum[7:0]; carry = sum[8]; end
      2'b01: y = a ^ b;
      2'b10: y = a & b;
      2'b11: begin y = {a[6:0], b[0]}; carry = a[7]; end
      default: begin y = 8'h00; carry = 1'b0; end
    endcase
  end
  assign zero = ~|y;
endmodule
