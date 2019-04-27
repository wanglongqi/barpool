# barpool
Maintain a pool of multiple intervals OHLC bars.

Please check tests in the folder for usage.

## Possible problems

Several possible pitfalls are not considered in the code:

1. Bar cutting time are cauluted by directly adding intervals to the start timestamp. If there is a minute with longer than 60 seconds, the bar data will be wrong after that. This case is not considered and tested in the code.
2. Time zone and DST are generally not considered, as they are generally not important for most use cases. For OHLC bar with interval longer than 1 hour, time zone may impact the final result.



