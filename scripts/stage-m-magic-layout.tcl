# Deterministic SKY130A bottom-up Q4 candidate routing. Native DRC/LVS mandatory.
# Every endpoint originates from actual .mag geometry and SPICE connectivity.
# DRC and LVS must independently pass. Do not infer signoff from geometry.
foreach var {STAGE_M_CELL STAGE_M_SCHEMATIC STAGE_M_ROUTE_PLAN} {
    if {![info exists ::env($var)]} {error "STAGE_M_FAIL: $var missing"}
}
set cell $::env(STAGE_M_CELL)
if {![info exists ::env(STAGE_M_TOP_CELL)]} {
    error "STAGE_M_FAIL: missing selected top-level physical source"
}
set top $::env(STAGE_M_TOP_CELL)
if {$top ni {q4_thresh_det q4_inv q4_mux4 q4_half_adder} ||
    ($cell ne $top && ![string match "${top}__*" $cell] &&
     $cell ni {q4_thresh_det q4_inv q4_mux4 q4_half_adder})} {
    error {STAGE_M_FAIL: non-SPICE hierarchy cell selection}
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
set ::stage_m_met3w [stage_m_u 0.32]
set ::stage_m_via2 [stage_m_u 0.20]
# Short source escapes stay on MET1. Vertical trunks stay on MET2;
# no horizontal shared-Y MET3 buses or unverified extra via2 cuts.
set ::stage_m_li1w [stage_m_u 0.34]
set ::stage_m_mcon [stage_m_u 0.17]
set ::stage_m_via [stage_m_u 0.15]
# Tag all newly painted routing copper with its schematic net.
# Overlapping same-layer routed rectangles on distinct nets are a short.
# Different-layer crossings remain legal until a via creates connectivity.
set ::stage_m_route_copper {}
set ::stage_m_route_active_net {}
proc stage_m_rect {layer x1 y1 x2 y2} {
    if {$x2 <= $x1 || $y2 <= $y1} {error "STAGE_M_FAIL: empty $layer rectangle"}
    if {$::stage_m_route_active_net ne {} &&
        $layer in {li1 met1 met2 met3 mcon via via2}} {
        foreach entry $::stage_m_route_copper {
            lassign $entry other lay ox1 oy1 ox2 oy2
            if {$lay ne $layer || $other eq $::stage_m_route_active_net} {continue}
            if {$x1 < $ox2 && $x2 > $ox1 && $y1 < $oy2 && $y2 > $oy1} {
                puts stderr "STAGE_M_COPPER_SHORT cell=$::stage_m_current layer=$layer nets=$other,$::stage_m_route_active_net old=$ox1,$oy1,$ox2,$oy2 new=$x1,$y1,$x2,$y2"
                error "STAGE_M_FAIL: geometric same-layer cross-net short (no waiver)"
            }
        }
        lappend ::stage_m_route_copper [list $::stage_m_route_active_net $layer $x1 $y1 $x2 $y2]
    }
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
proc stage_m_begin_cell {cell bbox port_ymin} {
    if {[llength $bbox] != 4} {error "STAGE_M_FAIL: no bbox for $cell"}
    lassign $bbox xmin ymin xmax ymax
    if {$xmax <= $xmin || $ymax <= $ymin} {error "STAGE_M_FAIL: corrupt bbox"}
    if {![string is integer -strict $port_ymin]} {
        error "STAGE_M_FAIL: authentic minimum port Y missing"
    }
    set ::stage_m_current $cell
    set ::stage_m_bbox $bbox
    set ::stage_m_nets {}
    set ::stage_m_route_copper {}
    set ::stage_m_route_active_net {}
    array unset ::stage_m_hier_escape
    array unset ::stage_m_hier_track
    array unset ::stage_m_pin_place
    array unset ::stage_m_pin_layer
    array unset ::stage_m_port_escape
    set ::stage_m_port_escape_index 0
    set ::stage_m_top [expr {$ymax + 2*$::stage_m_pitch}]
    # A supply rail inside the original source port bank shorts distinct
    # Metal1 ports even when every Metal2 escape column is unique.
    set ::stage_m_bottom [expr {min($ymin,$port_ymin) - 2*$::stage_m_pitch}]
    set ::stage_m_tapx [expr {$xmin - 5*$::stage_m_pitch}]
    # Source-pinned port pads often share X but sit at different Y positions.
    # Assign a strictly separate escape column outside ALL device geometry.
    set ::stage_m_port_escape_base [expr {$::stage_m_tapx - 3*$::stage_m_pitch}]
    stage_m_tap nwell nsdm $::stage_m_tapx $::stage_m_top
    stage_m_tap psub psdm $::stage_m_tapx $::stage_m_bottom
}
proc stage_m_hier_escape {name offset} {
    if {![string is integer -strict $offset] || abs($offset)>8 ||
        [info exists ::stage_m_hier_escape($name)]} {
        error "STAGE_M_FAIL: invalid or duplicate native hierarchy escape $name"
    }
    set ::stage_m_hier_escape($name) $offset
}
proc stage_m_hier_track {name coordinate} {
    if {![string is integer -strict $coordinate] ||
        [info exists ::stage_m_hier_track($name)]} {
        error "STAGE_M_FAIL: duplicate/non-grid hierarchy halo escape $name"
    }
    set ::stage_m_hier_track($name) $coordinate
}
proc stage_m_route_net {net terminals} {
    if {[llength $terminals] < 2 || [lsearch -exact $::stage_m_nets $net] >= 0} {
        error "STAGE_M_FAIL: missing/duplicate connections for $::stage_m_current/$net"
    }
    lappend ::stage_m_nets $net
    set ::stage_m_route_active_net $net
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
        if {[llength $terminal] != 9} {error "STAGE_M_FAIL: missing source-contact rectangle"}
        lassign $terminal name layer x sy lx ly rx ry original
        foreach v [list $x $sy $lx $ly $rx $ry] {
            if {![string is integer -strict $v]} {
                error "STAGE_M_FAIL: invalid source-contact coordinate $name"
            }
        }
        if {$lx>$x || $rx<$x || $ly>$sy || $ry<$sy || $lx>$rx || $ly>$ry} {
            error "STAGE_M_FAIL: terminal outside native Magic label $name"
        }
        if {$layer ni {m1 met1 metal1 li1 locali met3 metal3}} {
            error "STAGE_M_FAIL: invalid route terminal $name/$layer"
        }
        # Preserve the original Magic contact layer from pinned SKY130A
        # geometry: ndc/pdc/pc alias ndiffc/pdiffc/polycont.
        if {$original in {ndiffc ndc pdiffc pdc polycont pc
                          nsubdiffcont psubdiffcont}} {
            if {$layer ni {li1 locali}} {
                error "STAGE_M_FAIL: missing Li1 mapping $name/$original"
            }
        } elseif {$original eq "poly"} {
            # A bare poly gate has no authenticated contact yet. Paint
            # Magic's composite polycontact (pc), then require native DRC/LVS.
            stage_m_contact pc $x $sy [stage_m_u 0.17]
        } elseif {$original ni {m1 met1 metal1 li1 locali met3 metal3}} {
            error "STAGE_M_FAIL: unsupported genuine contact $original"
        }
        if {$layer in {li1 locali}} {
            # The physical Li1 landing must cover the ENTIRE authentic Magic
            # label/contact rectangle, not merely its centre point.
            set half [expr {int(ceil($::stage_m_li1w/2.0))}]
            stage_m_rect li1 [expr {min($lx,$x-$half)}] [expr {min($ly,$sy-$half)}]                               [expr {max($rx,$x+$half)}] [expr {max($ry,$sy+$half)}]
            stage_m_contact mcon $x $sy $::stage_m_mcon
        }
        if {$layer ni {met3 metal3}} {
            stage_m_contact met1 $x $sy $::stage_m_met1w
        } else {
            stage_m_contact met3 $x $sy $::stage_m_met3w
        }
        set route_x $x
        if {$::stage_m_is_parent && [info exists ::stage_m_hier_track($name)]} {
            # This track is outside the saved, actually routed child bbox,
            # allocated by the deterministic parent halo placer.
            set route_x $::stage_m_hier_track($name)
        } elseif {[string match {port:*} $name]} {
            # A port source label may share both source X and a Y region
            # with other external terminals. The prior Y-based offset
            # returned the *same MET2 trunk X* for every port whose
            # label was above bbox.ymin, shorting V3, V2, V1, V0, SUM.
            # Allocate a unique physical MET2 column for EACH source port,
            # in deterministic SPICE-net order. Never reuse one X by Y.
            if {![info exists ::stage_m_port_escape($name)]} {
                incr ::stage_m_port_escape_index
                set step [stage_m_u 1.20]
                set ::stage_m_port_escape($name) [expr {
                    $::stage_m_port_escape_base -
                    $::stage_m_port_escape_index * $step}]
            }
            set route_x $::stage_m_port_escape($name)
        } elseif {[string match {X*/*} $name] &&
                  $layer in {m1 met1 metal1}} {
            if {![info exists ::stage_m_hier_escape($name)]} {
                error "STAGE_M_FAIL: missing geometry-derived escape $name"
            }
            # Pin order is derived from actual native Metal1 label Y values.
            set route_x [expr {$x+$::stage_m_hier_escape($name)*[stage_m_u 0.70]}]
        } elseif {[string match {*/B} $name] &&
                  $net in {vdd vss v0 v3 VPWR VGND}} {
            # Gate and bulk share original X. Escape bulk horizontally in
            # MET1 before rising onto its own MET2 track.
            set route_x [expr {$x+[stage_m_u 1.00]}]
        }
        if {$::stage_m_is_parent} {
            # Parent-level crossings are MET3; connect the real MET1 terminal
            # to MET2 through a via, and MET2 to MET3 through via2.
            # Horizontal MET3 leaves the routed child footprint before the
            # vertical MET2 trunk enters the proven inter-child halo.
            if {$layer ni {met3 metal3}} {
                stage_m_contact via $x $sy $::stage_m_via
                stage_m_contact met2 $x $sy $::stage_m_met2w
                stage_m_contact via2 $x $sy $::stage_m_via2
            }
            if {$route_x != $x} {
                stage_m_segment met3 $x $sy $route_x $sy $::stage_m_met3w
            }
            stage_m_contact met3 $route_x $sy $::stage_m_met3w
            stage_m_contact met2 $route_x $sy $::stage_m_met2w
            stage_m_contact via2 $route_x $sy $::stage_m_via2
            stage_m_segment met2 $route_x $sy $route_x $y $::stage_m_met2w
            stage_m_contact met2 $route_x $y $::stage_m_met2w
            stage_m_contact via2 $route_x $y $::stage_m_via2
        } else {
            if {$route_x != $x} {
                stage_m_segment met1 $x $sy $route_x $sy $::stage_m_met1w
            }
            # Each leaf uses unique MET2 trunks above its own Li1/MET1 pads.
            stage_m_contact met1 $route_x $sy $::stage_m_met1w
            stage_m_contact via $route_x $sy $::stage_m_via
            stage_m_segment met2 $route_x $sy $route_x $y $::stage_m_met2w
            stage_m_contact met1 $route_x $y $::stage_m_met1w
            stage_m_contact via $route_x $y $::stage_m_via
        }
        set minx [expr {min($minx,$route_x)}]
        set maxx [expr {max($maxx,$route_x)}]
    }
    if {$::stage_m_is_parent} {
        stage_m_segment met3 $minx $y $maxx $y $::stage_m_met3w
        if {$net in {vdd v3 VPWR vss v0 VGND}} {
            # Parent bus is MET3 while the native well/substrate tap
            # reaches MET1. Explicitly connect through via -> MET2 ->
            # via2 rather than silently leaving the body unpowered.
            stage_m_contact via $::stage_m_tapx $y $::stage_m_via
            stage_m_contact met2 $::stage_m_tapx $y $::stage_m_met2w
            stage_m_contact via2 $::stage_m_tapx $y $::stage_m_via2
        }
        set ::stage_m_pin_layer($net) met3
    } else {
        stage_m_segment met1 $minx $y $maxx $y $::stage_m_met1w
        set ::stage_m_pin_layer($net) met1
    }
    set ::stage_m_pin_place($net) [list $minx $y]
    set ::stage_m_route_active_net {}
    puts "STAGE_M_NET_CANDIDATE $::stage_m_current/$net"
}
proc stage_m_finish_cell {cell ports} {
    if {$cell ne $::stage_m_current || [llength $::stage_m_nets] == 0} {
        error "STAGE_M_FAIL: incomplete cell routing coverage"
    }
    if {[llength $ports] != [llength [lsort -unique $ports]]} {
        error "STAGE_M_FAIL: duplicate schematic export pin names"
    }
    set pinid 0
    foreach p $ports {
        if {[lsearch -exact $::stage_m_nets $p] < 0} {
            error "STAGE_M_FAIL: missing schematic pin $cell/$p"
        }
        if {![info exists ::stage_m_pin_place($p)]} {
            error "STAGE_M_FAIL: no actual routed Metal1 pin track $cell/$p"
        }
        lassign $::stage_m_pin_place($p) px py
        set pl $::stage_m_pin_layer($p)
        set width [expr {$pl eq "met3" ? $::stage_m_met3w : $::stage_m_met1w}]
        set h [expr {int(ceil($width/2.0))}]
        box [format {%si} [expr {$px-$h}]] [format {%si} [expr {$py-$h}]]             [format {%si} [expr {$px+$h}]] [format {%si} [expr {$py+$h}]]
        # Only after physical routing do these become true Magic export ports.
        label $p FreeSans 16 0 0 0 c $pl
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
set count [drc list count total]
set f [open "$cell-magic-drc.txt" w]
puts $f "STAGE_M_DRC_COUNT $cell $count"
close $f
if {![string is integer -strict $count] || $count != 0} {
    error "STAGE_M_FAIL: DRC errors $cell $count"
}
extract all
# Magic's "ext2spice lvs" defaults to "subcircuit top auto".
# For a source-bound PEX that will be included in hierarchical ALU benches,
# always require a real top-level .subckt wrapper. This does not modify
# transistor geometry, waive DRC, or alter the LVS comparison.
ext2spice lvs
ext2spice subcircuit top on
ext2spice -o "$cell-lvs.spice"
ext2spice cthresh 0
ext2spice rthresh 0
ext2spice subcircuit top on
ext2spice -o "$cell-pex.spice"
gds write $cell
puts "STAGE_M_DRC_ZERO_PEX_GENERATED_LVS_STILL_REQUIRED $cell"
quit -noprompt
