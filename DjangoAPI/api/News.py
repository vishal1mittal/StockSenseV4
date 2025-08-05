import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

def NewsData(CompanyName, Link):
    Data = []

    company_name = CompanyName

    # Encode company name for URL
    encoded_name = quote_plus(company_name)

    # Use Google News RSS feed
    google_news_url = f'https://news.google.com/rss/search?q={encoded_name}&hl=en-US&gl=US&ceid=US:en'

    # Send a request to the RSS feed URL
    google_news_response = requests.get(google_news_url)

    # Parse the XML content of the response with BeautifulSoup and extract the article titles and links
    if google_news_response.status_code == 200:
        google_news_soup = BeautifulSoup(google_news_response.content, 'xml')
        google_news_items = google_news_soup.find_all('item')
        google_news_titles = [(item.title.text.strip(), item.link.text.strip()) for item in google_news_items]
    else:
        print('Error:', google_news_response.status_code)
        google_news_titles = []

    google_news_titles = google_news_titles[:5]
    if Link == 1:
        for i in range(len(google_news_titles)):
            print(google_news_titles[i])
            Data.append({
                "id": i+1,
                "News": google_news_titles[i][0],
                "Link": google_news_titles[i][1]
            })
    else:
        for i in range(len(google_news_titles)):
            Data.append({
                "id": i+1,
                "News": google_news_titles[i][0],
                "Link": google_news_titles[i][1]
            })

    return Data
