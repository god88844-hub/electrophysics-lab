# Phase18: same original ALU RTL as Phases 13-17, separate physical-flow synthesis.
# OpenROAD-flow-scripts SKY130HD. Model/technology demonstration ONLY.
export DESIGN_NAME = alu8
export PLATFORM = sky130hd
export VERILOG_FILES = /work/benchmarks/phase13/rtl/alu8.v
export SDC_FILE = /work/benchmarks/phase14/alu8-tt.sdc
export CORE_UTILIZATION = 30
export CORE_ASPECT_RATIO = 1
export CORE_MARGIN = 2
export PLACE_DENSITY = 0.45
