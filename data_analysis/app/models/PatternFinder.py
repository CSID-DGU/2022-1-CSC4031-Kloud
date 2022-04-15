import warnings
import matplotlib.pyplot as plt
from matplotlib.figure import Figure
import pandas as pd
import numpy as np
import json

warnings.filterwarnings("ignore")
class PatternFinder:
    def cosine_similarity(self,x,y):
        return np.dot(x,y) / (np.sqrt(np.dot(x,x)) * np.sqrt(np.dot(y,y)))
    def __init__(self,data):
        # with open('data.json', 'r') as f:
        #     data = json.load(f)
        # f.close()
        self.data = data
        self.cost = []
        for d in data["ResultsByTime"]:
            c = 0
            for d2 in d["Groups"]:
                c += float(d2['Metrics']['UnblendedCost']["Amount"])
            self.cost.append([d["TimePeriod"]["Start"],c])
        df = pd.DataFrame(self.cost)
        df.columns = ['date', 'cost']
        df.index = df["date"]
        self.close = df["cost"]
    
    def search(self,start_date,end_date,threshold=0.97):
        self.start_date = start_date
        self.end_date = end_date
        base = self.close[start_date:end_date]
        self.base_norm = (base - base.min()) / (base.max() - base.min())
        # 윈도우 사이즈 (몇일간의 패턴을 본건지?)
        self.window_size = len(base)
        # 예측 기간 
        self.next_date = 5
        moving_cnt = len(self.close) - self.window_size - self.next_date - 1
        print(moving_cnt,len(base))
        # 유사도 저장 리스트
        sim_list = []
        for i in range(moving_cnt):
            target = self.close[i:i+self.window_size]
            # Normalize(정규화)
            target_norm = (target - target.min()) / (target.max() - target.min())
            # 코싸인 유사도 저장(정규화 된 데이터와 기준이되는 데이터 사이에서 코싸인유사도 계산)
            cos_similarity = self.cosine_similarity(self.base_norm, target_norm)
            # 코싸인 유사도 <- i(인덱스), 시계열 데이터 함께 저장
            sim_list.append(cos_similarity)
        # 코싸인 유사도가 1에 가까운 패턴을 찾기 위함임
        self.cos_df = pd.Series(sim_list).sort_values(ascending=False)
        self.cos_df = self.cos_df.fillna(0)
        idx = 0
        if len(self.cos_df) !=0:
            idx = self.cos_df.index[0]

        top_ = self.close[idx : idx + self.window_size + self.next_date]
        self.top_norm = (top_ - top_.min()) / (top_.max() - top_.min())

        return self.cos_df

    def find_pattern(self,period=5):
        idx = 0
        if len(self.cos_df) !=0:
            idx = self.cos_df.index[0]

        top_ = self.close[idx : idx + self.window_size + self.next_date]
        self.top_norm = (top_ - top_.min()) / (top_.max() - top_.min())

        plt.plot(self.base_norm.values, label = "base")
        plt.plot(self.top_norm.values, label = "target")
        plt.axvline(x = len(self.base_norm) - 1, c = 'r', linestyle = '--')

        plt.axvspan(len(self.base_norm.values) - 1, len(self.top_norm.values) - 1, facecolor = "yellow", alpha=0.3)
        plt.legend()
        plt.show()
    
    def get_base_norm(self):
        return self.base_norm
    def get_target_norm(self):
        return self.top_norm
# p = PatternFinder("data.json")
# result = p.search('2022-03-20',"2022-04-05",threshold = 0.7)
# print(result)