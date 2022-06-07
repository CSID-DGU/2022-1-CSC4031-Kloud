from copyreg import pickle
from .da_worker import celery_task
from .models.PatternFinder import PatternFinder
from .models.ProPhetPatternFinder import ProPhetPatternFinder
from .request import get_cost_info
from datetime import timedelta, datetime


@celery_task.task(name='add')
def add(x, y):  # 예시
    return x + y


@celery_task.task(name="/cost/trend/similarity")
def pattern_finder(token: str, start_date="2022-02-02", end_date="2022-05-10" , threshold=0.5):
    data = get_cost_info(token)
    p = PatternFinder(data)
    # 날짜는 수정이 가능함 원하는 날짜가 들어오게 만들면 될 듯
    result = p.search('2022-02-02', "2022-05-17", threshold=0.5)
    # 패턴을 못찾은 경우 추후에 try,except로 수정해야할듯
    if len(result) == 0:
        print("threshold 혹은 date범위를 바꿔주어야함")
        pass
    base_norm = p.get_base_norm()
    top_norm = p.get_target_norm()
    answer = {}
    base_norm_index = base_norm.index
    for i in range(len(top_norm)):
        if i < len(base_norm):
            answer[base_norm_index[i]] = {"real_data": round(base_norm.iloc[i], 6),
                                          "expected_data": round(top_norm.iloc[i], 6)}
        else:
            temp_time = str(base_norm_index[-1]).split("-")
            time = datetime(int(temp_time[0]), int(temp_time[1]), int(temp_time[2]))
            now_time = time + timedelta(days=i - len(base_norm) + 1)
            now_time = str(now_time).split()[0]
            answer[now_time] = {"expected_data": round(top_norm.iloc[i], 6)}
    return answer


@celery_task.task(name="/cost/trend/prophet")
def pattern_finder2(token: str, yearly_seasonality, weekly_seasonality , daily_seasonality, n_changepoints, period):
    data = get_cost_info(token)
    answers = {}
    periods = [5,14,30]
    for idx,period_num in enumerate(periods):
        p = ProPhetPatternFinder(data=data,
                                yearly_seasonality = yearly_seasonality,
                                weekly_seasonality = weekly_seasonality,
                                daily_seasonality = daily_seasonality,
                                n_changepoints = n_changepoints,
                                period = period_num)

        p.model_fit()
        expected_data = p.expected_data()
        real_data = p.real_data()
        answer = {}
        # print(performance)
        for i in range(len(expected_data)):
            date = str(expected_data.ds.iloc[i]).split()[0]
            if i < len(real_data):
                answer[date] = {"real_data": round(real_data.y.iloc[i], 6),
                                "expected_data": {"yhat": round(expected_data.yhat.iloc[i], 6),
                                                "yhat_lower": round(expected_data.yhat_lower.iloc[i], 6),
                                                "yhat_upper": round(expected_data.yhat_upper.iloc[i], 6)}}
            else:
                answer[date] = {"expected_data": {"yhat": round(expected_data.yhat.iloc[i], 6),
                                                "yhat_lower": round(expected_data.yhat_lower.iloc[i], 6),
                                                "yhat_upper": round(expected_data.yhat_upper.iloc[i], 6)}}
        if idx == 0:
            answers["day"] = answer
        elif idx == 1:
            answers["week"] = answer
        elif idx == 2:
            answers["month"] = answer
    performance = p.performance()
    answers["Performance"] = performance

    return answers
