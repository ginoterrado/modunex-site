#!/usr/bin/env python3
"""
Localise images for the Modunex site.

Downloads every image currently hotlinked from modunex.com.au into ./img/
and rewrites the HTML to use relative paths.

Usage:
    python3 localise-images.py           # download + rewrite
    python3 localise-images.py --check   # list what would happen, change nothing

Run it from the folder containing index.html.
"""

import os, re, sys, glob, urllib.request, urllib.error

REMOTE = re.compile(r'https://www\.modunex\.com\.au/img/([^"\')\s]+)')
IMGDIR = "img"
CHECK = "--check" in sys.argv


def main():
    pages = sorted(glob.glob("*.html"))
    if not pages:
        sys.exit("No .html files here. Run this from the site folder.")

    wanted = set()
    for page in pages:
        with open(page, encoding="utf-8") as fh:
            wanted.update(REMOTE.findall(fh.read()))

    if not wanted:
        print("No hotlinked modunex.com.au images found. Already localised?")
        return

    print(f"{len(wanted)} unique image(s) referenced across {len(pages)} page(s).")

    if CHECK:
        for name in sorted(wanted):
            print("  would fetch", name)
        return

    os.makedirs(IMGDIR, exist_ok=True)
    ok, failed = [], []

    for name in sorted(wanted):
        dest = os.path.join(IMGDIR, name)
        if os.path.exists(dest):
            print("  have    ", name)
            ok.append(name)
            continue
        url = "https://www.modunex.com.au/img/" + name
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=30) as resp, open(dest, "wb") as out:
                out.write(resp.read())
            print(f"  fetched  {name}  ({os.path.getsize(dest):,} bytes)")
            ok.append(name)
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as err:
            print(f"  FAILED   {name}  ({err})")
            failed.append(name)

    if failed:
        print("\nSome downloads failed. Those references are left pointing at the")
        print("live site so nothing breaks. Re-run to retry:")
        for name in failed:
            print("   ", name)

    # Only rewrite references we actually hold locally.
    rewritten = 0
    for page in pages:
        with open(page, encoding="utf-8") as fh:
            src = fh.read()
        original = src
        for name in ok:
            src = src.replace("https://www.modunex.com.au/img/" + name, f"{IMGDIR}/{name}")
        if src != original:
            with open(page, "w", encoding="utf-8") as fh:
                fh.write(src)
            rewritten += 1

    print(f"\nDone. {len(ok)} image(s) local, {rewritten} page(s) rewritten.")
    print("Open index.html and confirm, then delete this script before deploying.")


if __name__ == "__main__":
    main()
