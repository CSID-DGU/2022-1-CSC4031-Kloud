import warnings
# import FinanceDataReader as fdr
# import matplotlib.pyplot as plt
# from matplotlib.figure import Figure
import pandas as pd
import numpy as np

warnings.filterwarnings("ignore")
class PatternFinder():
    def __init__(self,period=5):
        # 이후 5일의 예측
        self.period = period
    
    def set_stock(self,code: str):
        self.code = code
        # Data load
        self.data = fdr.DataReader(code)
        self.close = self.data["Close"]
        # 변동성
        self.change = self.data["Change"]
        return self.data
    
    def search(self, start_date, end_date, threshold = 0.97):
        base = self.close[start_date: end_date]
        self.base_norm = (base - base.min()) / (base.max() - base.min())
        self.base = base
    
        # display(base)
        print(base)
        
        window_size = len(base)
        moving_cnt = len(self.data) - window_size - self.period - 1
        cos_sims = self.__cosine_sims(moving_cnt, window_size)
        
        self.window_size = window_size
        cos_sims = cos_sims[cos_sims > threshold]
        
        return cos_sims
    
    def __cosine_sims(self, moving_cnt, window_size):
        def cosine_similarity(x,y):
            return np.dot(x,y) / (np.sqrt(np.dot(x,x)) * np.sqrt(np.dot(y,y)))
        
        # 유사도 저장 딕셔너리 
        sim_list = []
        
        for i in range(moving_cnt):
            target = self.close[i:i+window_size]
            
            # Normalize(정규화)
            target_norm = (target - target.min()) / (target.max() - target.min())

            # 코싸인 유사도 저장(정규화 된 데이터와 기준이되는 데이터 사이에서 코싸인유사도 계산)
            cos_similarity = cosine_similarity(self.base_norm, target_norm)

            # 코싸인 유사도 <- i(인덱스), 시계열 데이터 함께 저장
            sim_list.append(cos_similarity)
        return pd.Series(sim_list).sort_values(ascending=False)
    
    def plot_pattern(self, idx, period = 5):
        if period != self.period:
            self.period = period
        
        top = self.close[idx : idx + self.window_size + period]
        top_norm = (top - top.min()) / (top.max() - top.min())
        
        plt.plot(self.base_norm.values, label = "base")
        plt.plot(top_norm.values, label = "target")
        plt.axvline(x = len(self.base_norm) - 1, c = 'r', linestyle = '--')
        plt.axvspan(len(self.base_norm.values) - 1, len(top_norm.values) - 1, facecolor = "yellow", alpha=0.3)
#         plt.xticks(range(moving_cnt),self.base_norm.index)
        plt.legend()
        plt.show()
        
        preds = self.change[idx + self.window_size : idx + self.window_size + period]
        # display(preds)
        print(preds)
        
        print(f'pred :{preds.mean()*100}%')
        
    def stat_prediction(self, result, period=5):
        idx_list = list(result.keys())
        mean_list = []
        for idx in idx_list:
            pred = self.change[idx + self.window_size : idx + self.window_size + period]
            mean_list.append(pred.mean())
        return np.array(mean_list)
