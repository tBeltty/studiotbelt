import unittest, tempfile
from pathlib import Path
import numpy as np
from studiotbelt.core.pipeline import writer, put, finish, composite, frames

class CompositeTests(unittest.TestCase):
    def test_composite_alignment_and_subject_selection(self):
        with tempfile.TemporaryDirectory() as tmp:
            p = Path(tmp)
            arrays = {
                'original': np.full((64, 64, 3), (180, 40, 40), dtype=np.uint8),
                'depth': np.full((64, 64, 3), 100, dtype=np.uint8),
                'seg': np.full((64, 64, 3), 100, dtype=np.uint8)
            }
            arrays['seg'][16:48, 16:48] = [50, 177, 50]
            for name, a in arrays.items():
                c, s = writer(p / (name + '.mp4'), 64, 64)
                for i in range(4):
                    put(c, s, a, i)
                finish(c, s)
            self.assertEqual(composite(p / 'original.mp4', p / 'depth.mp4', p / 'seg.mp4', p), 4)
            a = next(frames(p / 'composite.mp4'))
            self.assertLess(np.max(np.abs(a[32, 32].astype(int) - 100)), 10)
            self.assertGreater(a[2, 2, 0], 160)
            self.assertLess(a[2, 2, 1], 60)

if __name__ == '__main__':
    unittest.main()
