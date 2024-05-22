import pickle
import numpy as np
import keras
import pandas as pd
from keras.preprocessing.sequence import pad_sequences
from wordcloud import WordCloud
import matplotlib.pyplot as plt
from pymongo import MongoClient
import io
import base64

# Connect to the MongoDB server
client = MongoClient('plz enter your db url conection')

# Select the Twitter database and the tweets collection
db = client['plz enter your db name']
collection = db['scrapes']

# Fetch the tweets from the MongoDB collection
data = []
for doc in collection.find():
    data.append(doc)

# Convert the fetched data to a pandas DataFrame
data = pd.DataFrame(data)
date_lst = data["time"].to_list()
lst = data.text.to_list()

# AI Model
model = keras.models.load_model('model_sentiment_v1.h5')
config = pickle.load(open('config.pkl', 'rb'))


def predict_sentiment(text_list, model, config):
    predictions = []
    tokenizer = config['tokenizer']['tokenizer']
    for text in text_list:
        text_sequences = tokenizer.texts_to_sequences([text])
        padded_sequences = pad_sequences(text_sequences, maxlen=config['tokenizer']['token_maxlen'],
                                         padding=config['tokenizer']['padding_type'],
                                         truncating=config['tokenizer']['truncating_type'],
                                         value=config['tokenizer']['padding_value'])
        sentiment = model.predict(padded_sequences, batch_size=1, verbose=0)[0]
        argmax_sent = np.argmax(sentiment)
        sentiment_text = 'Positive' if argmax_sent == 1 else 'Negative'
        sentiment_score = float(sentiment[argmax_sent])  # Convert numpy.float32 object to Python float
        predictions.append((sentiment_text, sentiment_score))
    return predictions


# Call the predict_sentiment function
sentiment = predict_sentiment(lst, model, config)
print(sentiment)

# Convert list items in sentiment elements from tuple to dictionary
tweet_lst = []
for i in sentiment:
    tweet_dict = {
        'Sentiment': i[0],
        'Score': i[1],
        'Text': lst.pop(0),
        'time': date_lst.pop(0)  # Update the index to date_lst.pop(0)
    }
    tweet_lst.append(tweet_dict)

# Connect to the target MongoDB database
target_client = MongoClient('plz enter your db url conection')
target_db = target_client['backend']
target_collection = target_db['ais']
target_collection.insert_many(tweet_lst)


# Pie Chart (Requirement 1)
def percentage(tweet_lst):
    positive_count = sum(1 for item in tweet_lst if item['Sentiment'] == 'Positive')
    negative_count = sum(1 for item in tweet_lst if item['Sentiment'] == 'Negative')
    positive_pct = positive_count / len(tweet_lst)
    negative_pct = negative_count / len(tweet_lst)

    # Insert the data into the 'output1' collection
    target_collection = target_db['prces']
    target_collection.insert_one({
        'positive_percentage': positive_pct,
        'negative_percentage': negative_pct
    })


percentage(tweet_lst)


# Sample Tweets (Requirement 2)
def get_high_score(tweet_lst):
    sorted_data = sorted(tweet_lst, key=lambda x: x['Score'], reverse=True)
    positive = []
    negative = []
    for i in range(len(tweet_lst)):
        if tweet_lst[i]['Sentiment'] == 'Positive':
            positive.append(tweet_lst[i])
        else:
            negative.append(tweet_lst[i])

    # Insert the data into the 'output2' collection
    target_collection = target_db['highs']
    target_collection.insert_one({
        'positive_tweets': positive[:2],
        'negative_tweets': negative[:2]
    })


get_high_score(tweet_lst)


# Trend (Requirement 3)
def trend(tweet_lst):
    # Convert tweet_lst to DataFrame
    df = pd.DataFrame(tweet_lst, columns=['Sentiment', 'Score', 'Text', 'time'])

    # Convert 'time' column to datetime
    df['time'] = pd.to_datetime(df['time'])

    # Sort DataFrame by 'time'
    df = df.sort_values(by='time')

    # Resample data to every 6 hours and count positive and negative occurrences
    df_resampled = df.resample('12h', on='time')['Sentiment'].value_counts().unstack().fillna(0)

    # Plotting positive trend
    plt.figure(figsize=(10, 6))
    plt.plot(df_resampled.index, df_resampled['Positive'], marker='o', color='b', linestyle='-', label='Positive')
    plt.xlabel('Time')
    plt.ylabel('Frequency')
    plt.title('Positive Trend Over Time (6-hour intervals)')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

    # Plotting negative trend
    plt.figure(figsize=(10, 6))
    plt.plot(df_resampled.index, df_resampled['Negative'], marker='o', color='r', linestyle='-', label='Negative')
    plt.xlabel('Time')
    plt.ylabel('Frequency')
    plt.title('Negative Trend Over Time (6-hour intervals)')
    plt.legend()
    plt.grid(True)
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.show()

    # Insert the data into the 'output3' collection
    # target_collection = target_db['output3']
    # target_collection.insert_one({
    #     'positive_trend': df_resampled['Positive'].tolist(),
    #     'negative_trend': df_resampled['Negative'].tolist()
    # })
    # Convert datetime index to list of strings
    x_values = df_resampled.index.strftime('%Y-%m-%d %H:%M:%S').tolist()

    # Get the y values
    y_values = df_resampled['Positive'].tolist()

    # Combine x and y values into a list of dictionaries
    data = [{'x': x, 'y': y} for x, y in zip(x_values, y_values)]

    # Save the data to the database
    target_collection = target_db['plottings']
    target_collection.insert_one({
        'data': data
    })



trend(tweet_lst)


# Word Cloud (Requirement 4)
def save_wordcloud_to_mongodb(tweet_lst):
    positive_tweets = [item['Text'] for item in tweet_lst if item['Sentiment'] == 'Positive']
    negative_tweets = [item['Text'] for item in tweet_lst if item['Sentiment'] == 'Negative']

    # Generate word cloud for positive tweets
    positive_text = " ".join(positive_tweets)
    positive_wordcloud = WordCloud(width=800, height=800,
                                   background_color='white',
                                   stopwords=None,
                                   min_font_size=10).generate(positive_text)

    # Generate word cloud for negative tweets
    negative_text = " ".join(negative_tweets)
    negative_wordcloud = WordCloud(width=800, height=800,
                                   background_color='white',
                                   stopwords=None,
                                   min_font_size=10).generate(negative_text)

    # Save word clouds as images
    positive_img_stream = io.BytesIO()
    positive_wordcloud.to_image().save(positive_img_stream, format='PNG')
    positive_img_stream.seek(0)
    positive_img_binary = positive_img_stream.read()

    negative_img_stream = io.BytesIO()
    negative_wordcloud.to_image().save(negative_img_stream, format='PNG')
    negative_img_stream.seek(0)
    negative_img_binary = negative_img_stream.read()

    # Store binary data in MongoDB
    target_collection = target_db['words']
    target_collection.insert_one({
        'positive_wordcloud': base64.b64encode(positive_img_binary).decode('utf-8'),
        'negative_wordcloud': base64.b64encode(negative_img_binary).decode('utf-8')
    })

# Call the function to save word clouds to MongoDB
save_wordcloud_to_mongodb(tweet_lst)
