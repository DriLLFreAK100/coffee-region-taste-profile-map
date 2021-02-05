import pandas as pd
import requests
from bs4 import BeautifulSoup

url = 'https://en.wikipedia.org/wiki/List_of_countries_by_coffee_production'

r = requests.get(url)
html = r.text

soup = BeautifulSoup(html)
table = soup.find('table', {"class": "wikitable"})

rows = table.find_all('tr')
data = []

for row in rows[1:]:
    cols = row.find_all('td')
    currentList = []

    for idx, ele in enumerate(cols):
        x = ele.text.strip().replace(',', '')

        if idx == 1:
            oddCharacterIndex = x.find('(')
            if oddCharacterIndex != -1:
                x = x[0: oddCharacterIndex]
        currentList.append(x)

    data.append([item for item in currentList if item])

result = pd.DataFrame(
    data, columns=['Rank', 'Country', 'Bags', 'MetricTons', 'Pounds'])

with open(r'C:\Users\blusk\Downloads\temp.json', 'w') as f:
    f.write(result.to_json(orient='records'))
