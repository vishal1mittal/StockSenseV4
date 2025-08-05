import statistics
import math
from . import HistoricalData as hd

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

def GetRisk(Symbol):

    closePrices = []
    MonthReturn = []

    for index, row in hd.GetHistoricalData(Symbol, "1mo").iterrows():
        closePrices.append(row['Close'])

    for i in range(1, len(closePrices)):
        MonthReturn.append(((closePrices[i]/closePrices[i-1])-1)*100)

    return(math.floor((statistics.stdev(MonthReturn)*math.sqrt(12)/10) * 100) / 100)
