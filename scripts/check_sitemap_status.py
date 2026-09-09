#!/usr/bin/env python3
"""
Check a submitted sitemap's status via the Search Console API — a quick
diagnostic for "did Google actually fetch it yet", without needing to
open Search Console's UI.

Uses the same credentials as search_console_report.py (see its
docstring / scripts/README.md for setup): GSC_SERVICE_ACCOUNT_FILE and
GSC_SITE_URL env vars.

Usage:
  python3 scripts/check_sitemap_status.py [sitemap-path]
  # sitemap-path defaults to sitemap.xml
"""
import os
import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]


def main():
    key_path = os.environ.get("GSC_SERVICE_ACCOUNT_FILE")
    site_url = os.environ.get("GSC_SITE_URL")
    if not key_path or not site_url:
        sys.exit("ERROR: GSC_SERVICE_ACCOUNT_FILE and GSC_SITE_URL must be set.")

    sitemap_path = sys.argv[1] if len(sys.argv) > 1 else "sitemap.xml"
    feedpath = site_url.rstrip("/") + "/" + sitemap_path if site_url.startswith("http") \
        else "https://" + site_url.split(":", 1)[1] + "/" + sitemap_path

    credentials = service_account.Credentials.from_service_account_file(key_path, scopes=SCOPES)
    service = build("searchconsole", "v1", credentials=credentials)

    result = service.sitemaps().get(siteUrl=site_url, feedpath=feedpath).execute()

    print(f"Sitemap: {result.get('path')}")
    print(f"Last submitted: {result.get('lastSubmitted', 'n/a')}")
    print(f"Last downloaded: {result.get('lastDownloaded', 'not yet downloaded')}")
    print(f"Pending: {result.get('isPending', 'n/a')}")
    print(f"Is sitemap index: {result.get('isSitemapsIndex', 'n/a')}")
    warnings = result.get("warnings")
    errors = result.get("errors")
    if warnings:
        print(f"Warnings: {warnings}")
    if errors:
        print(f"Errors: {errors}")
    contents = result.get("contents", [])
    if contents:
        print("Contents:")
        for c in contents:
            print(f"  type={c.get('type')} submitted={c.get('submitted')} indexed={c.get('indexed', 'n/a')}")
    else:
        print("Contents: none reported yet")


if __name__ == "__main__":
    main()
