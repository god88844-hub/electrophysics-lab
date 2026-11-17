# Three distinct cell-PVT views, ONE fixed post-route OpenRCX SPEF.
foreach key {PH20_ID PH20_CORNER PH20_LIB PH20_DB PH20_SDC PH20_SPEF} {
  if {![info exists env($key)]} { error "Missing environment $key" }
}
read_liberty $env(PH20_LIB)
read_db $env(PH20_DB)
read_sdc $env(PH20_SDC)
set db [ord::get_db]
set chip [$db getChip]
if {$chip eq "NULL"} {error "Missing actual routed OpenDB"}
set block [$chip getBlock]
set insts [$block getInsts]
set nets [$block getNets]
if {[llength $insts] < 1 || [llength $nets] < 10 || [llength [$block getBTerms]] != 30} {
  error "Unexpected routed OpenDB geometry"
}
read_spef $env(PH20_SPEF)
puts "PH20_CORNER_BEGIN $env(PH20_ID) $env(PH20_CORNER)"
puts "PH20_OPENDB_INSTANCES [llength $insts]"
puts "PH20_OPENDB_NETS [llength $nets]"
puts "PH20_SPEF_RELOADED"
foreach port {carry zero {y[0]} {y[1]} {y[2]} {y[3]} {y[4]} {y[5]} {y[6]} {y[7]}} {
  puts "PH20_PATH_BEGIN $port"
  report_checks -path_delay max -to [get_ports $port] -group_path_count 1
  puts "PH20_PATH_END $port"
}
puts "PH20_CORNER_END $env(PH20_ID)"
