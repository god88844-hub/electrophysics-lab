# Phase 15: one FRESH OpenSTA process per load/slew input combination.
# The external environment is constrained to the independently pinned grid.
read_liberty benchmarks/evidence/phase14/source/sky130_fd_sc_hd__tt_025C_1v80.lib
read_verilog benchmarks/evidence/phase14/alu8-sky130-mapped.v
link_design alu8
read_sdc benchmarks/phase14/alu8-tt.sdc
foreach key {PHASE15_ID PHASE15_SLEW PHASE15_LOAD} {
  if {![info exists env($key)]} { error "Required phase15 input missing: $key" }
}
set_input_transition $env(PHASE15_SLEW) [all_inputs]
set_load $env(PHASE15_LOAD) [all_outputs]
puts "PHASE15_CASE_BEGIN $env(PHASE15_ID) $env(PHASE15_SLEW) $env(PHASE15_LOAD)"
report_checks -path_delay max -group_count 10
puts "PHASE15_CASE_END $env(PHASE15_ID)"
