# Stage M deterministic SKY130A candidate placement; NOT final routed geometry.
# Must source the real open_pdks sky130A.magicrc in a genuine Magic process.
# magic::netlist_to_layout creates device geometries and ports; it does NOT
# automatically route every circuit connection. Failed DRC/LVS is fatal.
if {![info exists ::env(STAGE_M_CELL)]} {error "STAGE_M_FAIL: missing STAGE_M_CELL"}
if {![info exists ::env(STAGE_M_SCHEMATIC)]} {error "STAGE_M_FAIL: missing schematic"}
set cell $::env(STAGE_M_CELL)
set schematic $::env(STAGE_M_SCHEMATIC)
if {$cell ni {q4_thresh_det q4_inv q4_mux4 q4_half_adder}} {
  error "STAGE_M_FAIL: unrecognized Q4 cell"
}
if {![file isfile $schematic] || [file rootname [file tail $schematic]] ne $cell} {
  error "STAGE_M_FAIL: missing/mismatched schematic"
}
if {[llength [info commands magic::netlist_to_layout]] != 1 ||
    [llength [info commands sky130::sky130_fd_pr__nfet_01v8_draw]] != 1} {
  error "STAGE_M_FAIL: authentic SKY130A generators are missing"
}
puts "STAGE_M_IMPORT_START $cell"
magic::netlist_to_layout $schematic sky130
load $cell
select top cell
save $cell
drc on
drc check
set count [drc count total]
puts "STAGE_M_DRC_COUNT $cell $count"
set channel [open "$cell-magic-drc.txt" w]
puts $channel "STAGE_M_DRC_COUNT $cell $count"
close $channel
if {![string is integer -strict $count] || $count != 0} {
  error "STAGE_M_FAIL: Magic DRC must produce an explicit zero integer"
}
extract all
ext2spice lvs
ext2spice -o "$cell-lvs.spice"
ext2spice cthresh 0
ext2spice rthresh 0
ext2spice -o "$cell-pex.spice"
gds write $cell
puts "STAGE_M_NATIVE_LAYOUT_CREATED_NOT_LVS_VERIFIED $cell"
quit -noprompt
