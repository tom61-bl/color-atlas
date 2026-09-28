import re

file = r'D:\projects\color-atlas\index.html'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

nl = '\n'

# 1. Add CSS for case-image
css_anchor = '.case-card {' + nl + '  background: var(--card); border: 1px solid var(--border);'
css_insert = ('.case-image {' + nl +
'  width: 100%; height: 220px; object-fit: cover;' + nl +
'  display: block;' + nl +
'}' + nl + nl +
'.case-card {' + nl + '  background: var(--card); border: 1px solid var(--border);')
if css_anchor in content:
    content = content.replace(css_anchor, css_insert)
    print("1. CSS added")
else:
    print("1. CSS anchor NOT found")

# 2. Add image field to each case in JS data
cases_start = content.index('const cases = [')
cases_end = content.index('];', cases_start)
cases_section = content[cases_start:cases_end+2]
image_names = ['starry-night.jpg', 'water-lilies.jpg', 'pearl-earring.jpg',
                'thousand-miles.jpg', 'monument-valley.jpg', 'genshin-liyue.jpg']
img_idx = [0]

def add_image(match):
    result = match.group(1) + " image: 'images/" + image_names[img_idx[0]] + "',"
    img_idx[0] += 1
    return result

new_cases_section = re.sub(r'(title: "[^"]+",)', add_image, cases_section)
print(f"2. Added image fields to {img_idx[0]} cases")
content = content[:cases_start] + new_cases_section + content[cases_end+2:]

# 3. Modify render logic to include image
# Find the line with card.innerHTML = and the next line with case-header
render_anchor = "card.innerHTML =" + nl + "    '<div class=\"case-header\">' +"
render_insert = ("card.innerHTML =" + nl +
"    '<img class=\"case-image\" src=\"' + c.image + '\" alt=\"' + c.title + '\">' +" + nl +
"    '<div class=\"case-header\">' +")
if render_anchor in content:
    content = content.replace(render_anchor, render_insert)
    print("3. Render logic updated")
else:
    print("3. Render anchor NOT found")
    # Try to find what's actually there
    idx = content.find('card.innerHTML =')
    if idx >= 0:
        print("   Actual:", repr(content[idx:idx+120]))

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

import os
print(f"Saved. Size: {os.path.getsize(file)}")

# Verify
with open(file, 'r', encoding='utf-8') as f:
    c2 = f.read()
print("Has case-image CSS:", '.case-image' in c2)
print("Has image fields:", c2.count("image: 'images/"))
print("Has c.image in render:", 'c.image' in c2)
