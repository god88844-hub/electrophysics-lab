# Actual OpenSTA script: only a PRE-LAYOUT, TT-corner combinational check.
# No wire parasitics, placement, multi-corner analysis, or real silicon here.
read_liberty benchmarks/evidence/phase14/source/sky130_fd_sc_hd__tt_025C_1v80.lib
read_verilog benchmarks/evidence/phase14/alu8-sky130-mapped.v
if {![link_design alu8]} { error "ALU did not fully link" }
read_sdc benchmarks/phase14/alu8-tt.sdc
# Old OpenSTA lacks sizeof_collection; strict log checks all 10 distinct output endpoints.
puts "PHASE14_TIMING_PATHS_BEGIN"
report_checks -path_delay max -group_count 10
puts "PHASE14_TIMING_PATHS_END"
