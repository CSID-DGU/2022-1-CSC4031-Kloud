from pydantic import BaseModel, conlist, conint, constr, validator
from enum import Enum

MAXIMUM_DAYS = 180
MAXIMUM_DAYS_HOURLY = 14
GRANULARITY = ['HOURLY', 'DAILY', 'Monthly']
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


def gen_enum(lst: list) -> Enum:
    return Enum('enum', {lst[i]: lst[i] for i in range(len(lst))})


Granularity: Enum = gen_enum(GRANULARITY)
AvailableReservation: Enum = gen_enum(AVAILABLE_RESERVATION)
AvailableLookBackPeriod: Enum = gen_enum(AVAILABLE_LOOK_BACK_PERIOD)
PaymentOptions: Enum = gen_enum(PAYMENT_OPTIONS)
TermInYears: Enum = gen_enum(TERM_IN_YEARS)


class CostHistory(BaseModel):
    granularity: Granularity
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
    granularity: Granularity


class CostHistoryByService(BaseModel):
    days: conint(ge=1, le=MAXIMUM_DAYS)


class ReservationRecommendation(BaseModel):
    service: AvailableReservation
    look_back_period: AvailableLookBackPeriod
    years: TermInYears
    payment_option: PaymentOptions


class RightSizingRecommendation(BaseModel):
    within_same_instance_family: bool
    benefits_considered: bool


class TrendProphet(BaseModel):
    yearly_seasonality: bool
    weekly_seasonality: bool
    daily_seasonality: bool
    n_changepoints: int
    period: int
