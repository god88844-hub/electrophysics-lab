# Pre-layout educational combinational ALU. Virtual clock is a timing budget,
# NOT a physical clock pin or a setup/hold qualification claim.
create_clock -name vclk -period 20.0
set_input_delay -clock vclk -max 1.0 [all_inputs]
set_input_delay -clock vclk -min 0.0 [all_inputs]
set_output_delay -clock vclk -max 1.0 [all_outputs]
set_output_delay -clock vclk -min 0.0 [all_outputs]
set_input_transition 0.10 [all_inputs]
set_load 0.01 [all_outputs]
