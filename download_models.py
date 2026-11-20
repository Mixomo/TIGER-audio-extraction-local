"""Pre-download TIGER weights (and the demo examples) for an offline local run.

Uses the same repos, revisions and cache_dir as tiger_legacy.py so the app
finds everything already in ./cache on start.
"""
import shutil
import sys
from pathlib import Path

from huggingface_hub import hf_hub_download, snapshot_download

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

MODELS = [
    ("JusperLee/TIGER-DnR", "b7a59560bbca10febbcd46fb01600f868e587f57"),
    ("JusperLee/TIGER-speech", "f0340340b2d9bbf72074edf8c076dcab59a10ba2"),
]

EXAMPLE_REPO = "fffiloni/TIGER-audio-extraction"
EXAMPLE_REVISION = "206ed2cea4a0bbd6f3e5dc563ca26021dbc3f681"
EXAMPLES = {
    "test/test_mixture_466.wav": "sound-scene.wav",
    "test/mix.wav": "two-voices.wav",
    "assets/dnr-demo/sample3/mixture.mp4": "video.mp4",
}


def main():
    for repo, rev in MODELS:
        print(f"[models] {repo}@{rev[:8]}", flush=True)
        snapshot_download(repo_id=repo, revision=rev, cache_dir=str(ROOT / "cache"))

    # Example media for the UI "try an example" buttons (optional).
    for remote, local in EXAMPLES.items():
        target = ROOT / "examples" / local
        if target.is_file() and target.stat().st_size > 1024:
            continue
        print(f"[examples] {local}", flush=True)
        try:
            path = hf_hub_download(
                repo_id=EXAMPLE_REPO, repo_type="space", revision=EXAMPLE_REVISION,
                filename=remote, cache_dir=str(ROOT / "cache"), token=False,
            )
            target.parent.mkdir(exist_ok=True)
            shutil.copyfile(path, target)
        except Exception as exc:
            print(f"  warning: could not fetch example ({exc})", flush=True)

    # Load once to verify the weights deserialize correctly.
    import look2hear.models as m
    m.TIGERDNR.from_pretrained(MODELS[0][0], revision=MODELS[0][1], cache_dir=str(ROOT / "cache"))
    m.TIGER.from_pretrained(MODELS[1][0], revision=MODELS[1][1], cache_dir=str(ROOT / "cache"))
    print("[models] OK", flush=True)


if __name__ == "__main__":
    main()
