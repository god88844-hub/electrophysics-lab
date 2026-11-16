/* RISC-V unprivileged RV32I functional cross-check.
 * 10+9+...+1=55. ASCII('0')+55 is 'g'.
 * Linux write(1, &byte, 1), exit(0). No libc, no C runtime.
 * GNU binutils compiles for rv32i/ilp32. QEMU user-mode is an
 * INDEPENDENT instruction emulator; it is not physical validation.
 */
.option norvc
.option norelax
.section .text
.global _start
_start:
  addi t0, zero, 10
  addi t1, zero, 0
loop:
  add t1, t1, t0
  addi t0, t0, -1
  bne t0, zero, loop
  addi t1, t1, 48
  lla t2, output_byte
  sb t1, 0(t2)
  addi a0, zero, 1
  addi a1, t2, 0
  addi a2, zero, 1
  addi a7, zero, 64
  ecall
  addi a0, zero, 0
  addi a7, zero, 93
  ecall

.section .data
output_byte:
  .byte 0
