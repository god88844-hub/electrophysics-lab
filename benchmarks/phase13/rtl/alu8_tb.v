// Exhaustive behavioural test over ALL 8-bit A, 8-bit B and 2-bit op
// combinations = 256 * 256 * 4 = 262,144 functional input vectors.
// A single disagreement is a hard failure. Not a physically measured test.
module alu8_tb;
  reg [7:0] a,b;
  reg [1:0] op;
  wire [7:0] actual_y,expected_y;
  wire actual_carry,expected_carry;
  wire actual_zero,expected_zero;
  integer i,j,k,count;
  alu8 dut(.a(a),.b(b),.op(op),.y(actual_y),.carry(actual_carry),.zero(actual_zero));
  alu8_spec golden(.a(a),.b(b),.op(op),.y(expected_y),.carry(expected_carry),.zero(expected_zero));
  initial begin
    a=0;b=0;op=0;count=0;
    for(i=0;i<4;i=i+1)
      for(j=0;j<256;j=j+1)
        for(k=0;k<256;k=k+1) begin
          op=i;a=j;b=k;
          #1;
          if(actual_y !== expected_y || actual_carry !== expected_carry ||
             actual_zero !== expected_zero)
            $fatal(1,"ALU mismatch op=%0d a=%0d b=%0d y=%h vs %h",
              op,a,b,actual_y,expected_y);
          count=count+1;
        end
    if(count!==262144)$fatal(1,"Incomplete exhaustive test count %0d",count);
    $display("PHASE13 EXHAUSTIVE RTL PASS 262144/262144");
    $finish;
  end
endmodule
