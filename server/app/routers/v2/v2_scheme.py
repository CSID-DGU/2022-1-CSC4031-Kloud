from pydantic import BaseModel, conlist, conint, constr, validator
from typing import Any, Union, Sequence, Optional


MAXIMUM_DAYS = 180
MAXIMUM_DAYS_HOURLY = 14
GRANULARITY = constr(regex=r'DAILY|MONTHLY|HOURLY')


class CostHistory(BaseModel):
    granularity: GRANULARITY
    days: conint(ge=1, le=MAXIMUM_DAYS)

    @validator('days')
    def validate_days(cls, v, values) -> int:
        maximum_days_available: int = MAXIMUM_DAYS
        if values.get('granularity') == 'HOURLY':
            maximum_days_available = MAXIMUM_DAYS_HOURLY
        if v > maximum_days_available:
            raise ValueError(f"ValueError: days cannot exceed {maximum_days_available}")
        return v


class CostHistoryByResource(BaseModel):
    specific: bool
    granularity: GRANULARITY


class CostHistoryByService(BaseModel):
    days: conint(ge=1, le=MAXIMUM_DAYS)


AVAILABLE_RESERVATION = ['Amazon Elastic Compute Cloud - Compute',
                         'Amazon Relational Database Service',
                         'Amazon Redshift',
                         'Amazon ElastiCache',
                         'Amazon Elasticsearch Service',
                         'Amazon OpenSearch Service']
AVAILABLE_LOOK_BACK_PERIOD = ['SEVEN_DAYS', 'THIRTY_DAYS', 'SIXTY_DAYS']
PAYMENT_OPTIONS = ['NO_UPFRONT', 'PARTIAL_UPFRONT', 'ALL_UPFRONT', 'LIGHT_UTILIZATION', 'MEDIUM_UTILIZATION',
                   'HEAVY_UTILIZATION']
TERM_IN_YEARS = ['ONE_YEAR', 'THREE_YEARS']

REGEX_AR = '|'.join(AVAILABLE_RESERVATION)
REGEX_ALBP = '|'.join(AVAILABLE_LOOK_BACK_PERIOD)
REGEX_PO = '|'.join(PAYMENT_OPTIONS)
REGEX_TIY = '|'.join(TERM_IN_YEARS)


class ReservationRecommendation(BaseModel):
    service: constr(regex=REGEX_AR)
    look_back_period: constr(regex=REGEX_ALBP)
    years: constr(regex=REGEX_TIY)
    payment_option: constr(regex=REGEX_PO)


class RightSizingRecommendation(BaseModel):
    within_same_instance_family: bool
    benefits_considered: bool


class TrendProphet(BaseModel):
    yearly_seasonality: bool
    weekly_seasonality: bool
    daily_seasonality: bool
    n_changepoints: int
    period: int

