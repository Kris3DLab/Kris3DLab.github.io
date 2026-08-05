import urllib.request
import re

def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=15).read().decode('utf-8', errors='ignore')

d = fetch('https://www.youtube.com/watch?v=P3VhWgR6pCg')

for pat in [r'"channelId":"(UC[\w-]{22})"', r'"browseId":"(UC[\w-]{22})"', r'"externalChannelId":"(UC[\w-]{22})"', r'"authorChannelId".*?"value":"(UC[\w-]{22})"']:
    m = re.search(pat, d)
    print(pat, '->', m.group(1) if m else 'none')
