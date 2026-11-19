# Deterministic SKY130A two-layer Q4 candidate routing.
# Every endpoint originates from actual .mag geometry and SPICE connectivity.
# DRC and LVS must independently pass. Do not infer signoff from geometry.
foreach var {STAGE_M_CELL STAGE_M_SCHEMATIC STAGE_M_ROUTE_PLAN} {
    if {![info exists ::env($var)]} {error "STAGE_M_FAIL: $var missing"}
}
set cell $::env(STAGE_M_CELL)
if {$cell ni {q4_thresh_det q4_inv q4_mux4 q4_half_adder}} {
    error {STAGE_M_FAIL: unknown cell}
}
if {![file isfile $::env(STAGE_M_SCHEMATIC)] || ![file isfile $::env(STAGE_M_ROUTE_PLAN)] ||
    ![file isfile "$cell.mag"]} {error "STAGE_M_FAIL: no authentic geometry/netlist"}
set ::stage_m_scale [cif scale out]
if {![string is double -strict $::stage_m_scale] || $::stage_m_scale <= 0} {
    error "STAGE_M_FAIL: invalid PDK grid metric"
}
proc stage_m_u {um} {expr {int(ceil(double($um)/$::stage_m_scale))}}
set ::stage_m_pitch [stage_m_u 2.72]
set ::stage_m_met1w [stage_m_u 0.28]
set ::stage_m_met2w [stage_m_u 0.28]
set ::stage_m_li1w [stage_m_u 0.34]
set ::stage_m_mcon [stage_m_u 0.17]
set ::stage_m_via [stage_m_u 0.15]
proc stage_m_rect {layer x1 y1 x2 y2} {
    if {$x2 <= $x1 || $y2 <= $y1} {error "STAGE_M_FAIL: empty $layer rectangle"}
    box [format {%si} $x1] [format {%si} $y1] [format {%si} $x2] [format {%si} $y2]
    paint $layer
}
proc stage_m_contact {layer x y width} {
    set h [expr {int(ceil($width/2.0))}]
    stage_m_rect $layer [expr {$x-$h}] [expr {$y-$h}] [expr {$x+$h}] [expr {$y+$h}]
}
proc stage_m_segment {layer x1 y1 x2 y2 width} {
    set h [expr {int(ceil($width/2.0))}]
    stage_m_rect $layer [expr {min($x1,$x2)-$h}] [expr {min($y1,$y2)-$h}] [expr {max($x1,$x2)+$h}] [expr {max($y1,$y2)+$h}]
}
proc stage_m_tap {kind implant x y} {
    # SKY130 Magic compound contact layers nsc/psc map physically to
    # nsdm/psdm doped well/substrate taps with real licon1+li1.
    # Raw mask names are not independent Magic paint layers in this PDK.
    # All enclosing implant, well, and contact rules remain under native DRC.
    set d [stage_m_u 0.60]
    set enc [stage_m_u 1.20]
    if {$kind eq "nwell" && $implant eq "nsdm"} {
        stage_m_rect nwell [expr {$x-$enc}] [expr {$y-$enc}] [expr {$x+$enc}] [expr {$y+$enc}]
        stage_m_rect nsc [expr {$x-$d}] [expr {$y-$d}] [expr {$x+$d}] [expr {$y+$d}]
    } elseif {$kind eq "psub" && $implant eq "psdm"} {
        stage_m_rect psc [expr {$x-$d}] [expr {$y-$d}] [expr {$x+$d}] [expr {$y+$d}]
    } else {
        error "STAGE_M_FAIL: unrecognized SKY130 well/substrate tap type"
    }
    # Contact nsc/psc already touches local interconnect via the licon1 cut.
    stage_m_contact li1 $x $y $::stage_m_li1w
    stage_m_contact mcon $x $y $::stage_m_mcon
    stage_m_contact met1 $x $y $::stage_m_met1w
}
proc stage_m_begin_cell {cell bbox} {
    if {[llength $bbox] != 4} {error "STAGE_M_FAIL: no bbox for $cell"}
    lassign $bbox xmin ymin xmax ymax
    if {$xmax <= $xmin || $ymax <= $ymin} {error "STAGE_M_FAIL: corrupt bbox"}
    set ::stage_m_current $cell
    set ::stage_m_bbox $bbox
    set ::stage_m_nets {}
    set ::stage_m_top [expr {$ymax + 2*$::stage_m_pitch}]
    set ::stage_m_bottom [expr {$ymin - 2*$::stage_m_pitch}]
    set ::stage_m_tapx [expr {$xmin - 5*$::stage_m_pitch}]
    stage_m_tap nwell nsdm $::stage_m_tapx $::stage_m_top
    stage_m_tap psub psdm $::stage_m_tapx $::stage_m_bottom
}
proc stage_m_route_net {net terminals} {
    if {[llength $terminals] < 2 || [lsearch -exact $::stage_m_nets $net] >= 0} {
        error "STAGE_M_FAIL: missing/duplicate connections for $::stage_m_current/$net"
    }
    lappend ::stage_m_nets $net
    if {$net in {vdd v3 VPWR}} {
        set y $::stage_m_top
        set minx $::stage_m_tapx
        set maxx $minx
    } elseif {$net in {vss v0 VGND}} {
        set y $::stage_m_bottom
        set minx $::stage_m_tapx
        set maxx $minx
    } else {
        set y [expr {[lindex $::stage_m_bbox 3]+(3+[llength $::stage_m_nets])*$::stage_m_pitch}]
        set minx [lindex [lindex $terminals 0] 2]
        set maxx $minx
    }
    foreach terminal $terminals {
        if {[llength $terminal] != 4} {error "STAGE_M_FAIL: invalid source terminal"}
        lassign $terminal name layer x sy
        if {![string is integer -strict $x] || ![string is integer -strict $sy] ||
            $layer ni {m1 met1 metal1 li1 locali}} {
            error "STAGE_M_FAIL: invalid terminal geometry $name"
        }
        if {$layer in {li1 locali}} {
            stage_m_contact li1 $x $sy $::stage_m_li1w
            stage_m_contact mcon $x $sy $::stage_m_mcon
        }
        stage_m_contact met1 $x $sy $::stage_m_met1w
        stage_m_contact via $x $sy $::stage_m_via
        stage_m_segment met2 $x $sy $x $y $::stage_m_met2w
        stage_m_contact met1 $x $y $::stage_m_met1w
        stage_m_contact via $x $y $::stage_m_via
        set minx [expr {min($minx,$x)}]
        set maxx [expr {max($maxx,$x)}]
    }
    stage_m_segment met1 $minx $y $maxx $y $::stage_m_met1w
    puts "STAGE_M_NET_CANDIDATE $::stage_m_current/$net"
}
proc stage_m_finish_cell {cell ports} {
    if {$cell ne $::stage_m_current || [llength $::stage_m_nets] == 0} {
        error "STAGE_M_FAIL: incomplete cell routing coverage"
    }
    set pinid 0
    foreach p $ports {
        if {[lsearch -exact $::stage_m_nets $p] < 0} {
            error "STAGE_M_FAIL: missing schematic pin $cell/$p"
        }
        if {[catch {findlabel $p} message]} {
            error "STAGE_M_FAIL: no physical pin label $cell/$p ($message)"
        }
        label $p FreeSans 16 0 0 0 c met1
        port make $pinid
        incr pinid
    }
    save $cell
    puts "STAGE_M_LAYOUT_CANDIDATE $cell [llength $::stage_m_nets] nets"
}
source $::env(STAGE_M_ROUTE_PLAN)
load $cell
select top cell
save $cell
drc on
drc check
set count [drc count total]
set f [open "$cell-magic-drc.txt" w]
puts $f "STAGE_M_DRC_COUNT $cell $count"
close $f
if {![string is integer -strict $count] || $count != 0} {
    error "STAGE_M_FAIL: DRC errors $cell $count"
}
extract all
ext2spice lvs
ext2spice -o "$cell-lvs.spice"
ext2spice cthresh 0
ext2spice rthresh 0
ext2spice -o "$cell-pex.spice"
gds write $cell
puts "STAGE_M_DRC_ZERO_PEX_GENERATED_LVS_STILL_REQUIRED $cell"
quit -noprompt
