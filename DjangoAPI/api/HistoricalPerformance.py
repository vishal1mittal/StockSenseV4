from . import HistoricalData as hd

def truncate(number, decimals=2):
    factor = 10.0 ** decimals
    return int(number * factor) / factor

def GetHistory(Symbol, Period):
    HistoricalData = hd.GetHistoricalData(Symbol, Period)
    ClosePrice = []
    for i in range(len(HistoricalData)):
        ClosePrice.append({
            "date": HistoricalData["Date"][i],
            "price": truncate(HistoricalData["Close"][i], 2),
            "volume": truncate(HistoricalData["Volume"][i], 2)  # Only if volume is a float
        })

    return ClosePrice
