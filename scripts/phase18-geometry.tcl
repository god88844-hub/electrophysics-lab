# Independently inspect an actual produced OpenDB, not self-reported flow JSON.
if {![info exists env(PH18_ODB)]} { error "Missing routed OpenDB" }
read_db $env(PH18_ODB)
set db [ord::get_db]
set chip [$db getChip]
if {$chip eq "NULL"} { error "No OpenDB chip" }
set block [$chip getBlock]
if {$block eq "NULL"} { error "No OpenDB block" }
set die [$block getDieArea]
set dx [expr {[$die xMax] - [$die xMin]}]
set dy [expr {[$die yMax] - [$die yMin]}]
set cells [$block getInsts]
set placed 0
foreach cell $cells {
  if {[$cell isPlaced]} { incr placed }
}
set nets [$block getNets]
set bterms [$block getBTerms]
puts "PH18_GEOMETRY_BEGIN"
puts "PH18_DIE_DBUNITS $dx $dy"
puts "PH18_INSTANCES [llength $cells]"
puts "PH18_PLACED $placed"
puts "PH18_NETS [llength $nets]"
puts "PH18_BTERMS [llength $bterms]"
puts "PH18_GEOMETRY_END"
if {$dx <= 0 || $dy <= 0 || [llength $cells] < 1 || $placed != [llength $cells] || [llength $nets] < 1 || [llength $bterms] != 28} {
  error "Geometry is absent, unplaced, unconnected or has unexpected IO"
}
