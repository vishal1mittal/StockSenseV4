from . import CompanyData as cd

data = cd.data
def Info(Company_Name):
    for item in data:
        if item['Symbol'] == Company_Name:
            return(item)