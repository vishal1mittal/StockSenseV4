import yfinance as yf
import os, sys
import pandas as pd

class HiddenPrints:
    def __enter__(self):
        # Storing the original standard output
        self._original_stdout = sys.stdout
        # Redirecting the standard output to /dev/null
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        # Closing the standard output
        sys.stdout.close()
        # Restoring the original standard output
        sys.stdout = self._original_stdout

def GetHistoricalData(Company_Symbol, period):
    try:
        with HiddenPrints():
            Company = yf.Ticker(Company_Symbol)
            CompanyHistory = Company.history(period=period)[['High','Low','Close','Volume']]
            CompanyHistory = CompanyHistory.reset_index()
            CompanyHistory["Date"] = pd.to_datetime(CompanyHistory["Date"]).dt.strftime('%Y-%m-%d')

    except:
        print("An error occurred while retrieving the data from the API")
        return None

    return(CompanyHistory)