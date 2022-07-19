import { strictEqual } from 'node:assert'
import fmix from './index.js'

strictEqual(fmix(0), 0)

strictEqual(fmix(0x20645650), 0x8d69a732)
strictEqual(fmix(0x35742f07), 0x9cd4a747)
strictEqual(fmix(0x3a7d2a06), 0xf317e399)
strictEqual(fmix(0x5456a322), 0x468db38a)
strictEqual(fmix(0x6f5e7ee3), 0x84b3daac)
strictEqual(fmix(0xafacfcf9), 0x1e273f97)
strictEqual(fmix(0xb1bb772d), 0x19f54a85)
strictEqual(fmix(0xb2f541ba), 0x22a57a9c)
strictEqual(fmix(0xc4829a56), 0xcffc790b)
strictEqual(fmix(0xdb12e192), 0x173ea289)
strictEqual(fmix(0xdcaf6ceb), 0x4249660f)
strictEqual(fmix(0xdeadbeef), 0x0de5c6a9)
strictEqual(fmix(0xdeed8655), 0xa8180872)
strictEqual(fmix(0xe458ddfc), 0xee1fc9fc)
strictEqual(fmix(0xfd7e6623), 0xbde895f1)
strictEqual(fmix(0xfe15c4d2), 0x67809cf5)
strictEqual(fmix(0xff0ac0a8), 0x4074c32d)
