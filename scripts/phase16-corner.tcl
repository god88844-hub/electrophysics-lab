# Executed separately per actual standard-cell TT, SS, FF Liberty view.
# Single mapped combinational ALU, virtual I/O budget, NO placed/routed wires.
foreach key {PHASE16_CORNER_ID PHASE16_CORNER_NAME PHASE16_LIBRARY} {
  if {![info exists env($key)]} { error "Missing required corner environment $key" }
}
read_liberty $env(PHASE16_LIBRARY)
read_verilog benchmarks/evidence/phase14/alu8-sky130-mapped.v
link_design alu8
read_sdc benchmarks/phase14/alu8-tt.sdc
puts "PHASE16_CORNER_BEGIN $env(PHASE16_CORNER_ID) $env(PHASE16_CORNER_NAME)"
report_checks -path_delay max -group_count 10
puts "PHASE16_CORNER_END $env(PHASE16_CORNER_ID)"
