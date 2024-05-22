import time
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sys

# Get the search topic from command-line argument
topic = sys.argv[1] if len(sys.argv) > 1 else ''

username = 'your username'
password = 'your pass'
max_tweets = 12

def scroll_down(browser):
    browser.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)

options = webdriver.FirefoxOptions()
options.add_argument('--headless')

tweets_data = []

with webdriver.Firefox(options=options) as browser:
    url = 'https://twitter.com/'
    browser.get(url)

    wait = WebDriverWait(browser, 15)

    login_button = wait.until(EC.presence_of_element_located((By.XPATH, '//a[@href="/login"]')))
    
    # Use JavaScript to click the login button
    browser.execute_script("arguments[0].click();", login_button)

    username_input = wait.until(EC.presence_of_element_located((By.XPATH, './/input[@name="text"]')))
    username_input.send_keys(username)
    username_input.send_keys(Keys.RETURN)

    time.sleep(3)

    password_input = wait.until(EC.presence_of_element_located((By.XPATH, './/input[@name="password"]')))
    password_input.send_keys(password)
    password_input.send_keys(Keys.RETURN)

    wait.until(EC.presence_of_element_located((By.XPATH, '//input[@enterkeyhint="search"]')))

    search_input = browser.find_element(By.XPATH, '//input[@enterkeyhint="search"]')
    search_input.send_keys(topic)
    search_input.send_keys(Keys.RETURN)

    current_tweets = 0

    while current_tweets < max_tweets:

        for _ in range(5):
            scroll_down(browser)

        tweets = wait.until(EC.presence_of_all_elements_located((By.XPATH, '//article[@role="article"]')))
        
        for tweet in tweets:
            try:
                user = tweet.find_element(By.XPATH, './/span[contains(text(), "@")]').text
                text = tweet.find_element(By.XPATH, ".//div[@lang]").text
                tweet_time = tweet.find_element(By.XPATH, ".//time").get_attribute("datetime")

                tweets_data.append({'user': user, 'text': text, 'time': tweet_time})
            except Exception as e:
                print(f"Error extracting tweet: {e}")

            current_tweets += 1

        if current_tweets >= max_tweets:
            break

print(json.dumps(tweets_data))

