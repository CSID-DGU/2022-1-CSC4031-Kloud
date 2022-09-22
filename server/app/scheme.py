from enum import Enum

from pydantic import BaseModel, conint, validator

MAXIMUM_DAYS = 180
MAXIMUM_DAYS_HOURLY = 14
GRANULARITY = ['HOURLY', 'DAILY', 'MONTHLY']
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


def gen_enum(lst: list) -> Enum:  # Enum class 생성
    return Enum(lst[0], {lst[i]: lst[i] for i in range(len(lst))})


Granularity: Enum = gen_enum(GRANULARITY)
AvailableReservation: Enum = gen_enum(AVAILABLE_RESERVATION)
AvailableLookBackPeriod: Enum = gen_enum(AVAILABLE_LOOK_BACK_PERIOD)
PaymentOptions: Enum = gen_enum(PAYMENT_OPTIONS)
TermInYears: Enum = gen_enum(TERM_IN_YEARS)


class CostHistory(BaseModel):
    granularity: Granularity = 'DAILY'
    days: conint(ge=1, le=MAXIMUM_DAYS) = 90

    @validator('days')
    def validate_days(cls, v, values) -> int:
        maximum_days_available: int = MAXIMUM_DAYS
        if values.get('granularity') == 'HOURLY':
            maximum_days_available = MAXIMUM_DAYS_HOURLY
        if v > maximum_days_available:
            raise ValueError(
                f"ValueError: days cannot exceed {maximum_days_available} with granularity {values.get('granularity')}")
        return v

    class Config:
        use_enum_values = True


class CostHistoryByResource(BaseModel):
    specific: bool = False
    granularity: Granularity = 'MONTHLY'

    class Config:
        use_enum_values = True


class CostHistoryByService(BaseModel):
    days: conint(ge=1, le=MAXIMUM_DAYS) = 90


class ReservationRecommendation(BaseModel):
    service: AvailableReservation
    look_back_period: AvailableLookBackPeriod
    years: TermInYears
    payment_option: PaymentOptions

    class Config:
        use_enum_values = True


class RightSizingRecommendation(BaseModel):
    within_same_instance_family: bool = True
    benefits_considered: bool = True


class TrendProphet(BaseModel):
    yearly_seasonality: bool = False
    weekly_seasonality: bool = True
    daily_seasonality: bool = True
    n_changepoints: int = 7
    period: int = 5
