import statistics 
from . import HistoricalData as hd

def conclusive_data(Company_Symbol, Period):
    try:
        Data = hd.GetHistoricalData(Company_Symbol, Period) # Get data from the API
    except Exception as e:
        print("Error in fetching data: ", e)
        return None
    
    if(Data is None): # If data is not available
        return None
    
    try:
        numeric_cols = Data.select_dtypes(include='number').columns.tolist()
        Mean_Data = round(Data[numeric_cols].mean(axis = 0),2) # Average among columns
    except Exception as e:
        print("Error in calculating mean of data: ", e)
        return None

    Mean_High = Mean_Data['High']
    Mean_Low = Mean_Data['Low']
    Mean_Close = Mean_Data['Close']

    Difference = round(Mean_High - Mean_Low, 2)
    try:
        Pivot_Point = round(statistics.mean([Mean_High, Mean_Low, Mean_Close]), 2)
    except Exception as e:
        print("Error in calculating pivot point: ", e)
        return None

    R1 = round((Pivot_Point * 2) - Mean_Low, 2)
    R2 = round(Pivot_Point + Difference, 2)
    R3 = round(Mean_High + Difference, 2)

    S1 = round((Pivot_Point * 2) - Mean_High, 2)
    S2 = round(Pivot_Point - Difference, 2)
    S3 = round(Mean_Low - Difference, 2)

    return {"Mean_High": Mean_High, "Mean_Low": Mean_Low,
            "Mean_Close": Mean_Close, "Difference": Difference,
            "Pivot_Point": Pivot_Point, "R1": R1, "R2": R2,
            "R3": R3, "S1": S1, "S2": S2, "S3": S3}