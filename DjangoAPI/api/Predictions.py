from . import HistoricalData as hd
import datetime
import numpy as np

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

def PredictionData(Symbol, Period, FDays):
    HistoricalData = hd.GetHistoricalData(Symbol, Period)
    x = HistoricalData[['High', 'Low']].values
    y = HistoricalData['Close'].values

    x_train,x_test,y_train,y_test = train_test_split(x,y,test_size=0.2,random_state=0)

    regressor = LinearRegression()

    regressor.fit(x_train, y_train)

    lastData = HistoricalData.tail(1)[['High', 'Low']].values
    
    range_pct = 0.05
    today = datetime.datetime.today()

    PredictedPrices = []

    for i in range(0, FDays):
        date = today + datetime.timedelta(days=i)
        nextPrediction = regressor.predict(lastData)[0]
        NextDate = date.date()
        timestamp = int(datetime.datetime(NextDate.year, NextDate.month, NextDate.day).timestamp())
        
        PredictedPrices.append({"Id": i, "Date": str(NextDate), "Price": nextPrediction})
        np.random.seed(timestamp)

        range_val = nextPrediction * range_pct

        NewHigh = nextPrediction + np.random.uniform(-range_val, range_val)
        NewLow = nextPrediction - np.random.uniform(-range_val, range_val)
        
        lastData = [[NewHigh, NewLow]]

    return PredictedPrices