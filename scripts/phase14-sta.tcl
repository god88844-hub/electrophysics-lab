# Actual OpenSTA script: only a PRE-LAYOUT, TT-corner combinational check.
# No wire parasitics, placement, multi-corner analysis, or real silicon here.
read_liberty benchmarks/evidence/phase14/source/sky130_fd_sc_hd__tt_025C_1v80.lib
read_verilog benchmarks/evidence/phase14/alu8-sky130-mapped.v
if {![link_design -no_black_boxes alu8]} { error "ALU did not fully link" }
read_sdc benchmarks/phase14/alu8-tt.sdc
set n_in [sizeof_collection [all_inputs]]
set n_out [sizeof_collection [all_outputs]]
puts "PHASE14_PORT_COUNTS $n_in $n_out"
if {$n_in != 18 || $n_out != 10} { error "Unexpected ALU port dimensions" }
puts "PHASE14_TIMING_PATHS_BEGIN"
report_checks -path_delay max -group_path_count 10
puts "PHASE14_TIMING_PATHS_END"
