
<p align="center">

<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>


# Homebridge Shelly 1 Garage Door

> ⚠️ This is a plugin I wrote for my own use case. If you want to use this I advise you to fork this plugin as I'm not planning to update this plugin anymore. 

This is a custom plugin that provides a Garage Door in HomeKit which controls a Shelly 1 relay.

It is configured to only send a single command to your Shelly local API (`http://{shellyIp}/relay/0?turn=on`). 

Within the Home app the garage door will simulate the opening time using `openTime` and closing time using `closeTime` (in seconds).
It will also automatically close after X amount of seconds defined in `autoCloseTime`.

## Configuration

### Properties

| Name             | Description                                       | Default   |
|------------------|---------------------------------------------------|-----------|
| `name`           | Name of your garage door in Home app              | `Garage`  |
| `shellyIp`       | IP address of your Shelly 1                       | N/A       |
| `shellyUsername` | Username of your Shelly 1 (if secured)            | N/A       |
| `shellyPassword` | Password of your Shelly 1 (if secured)            | N/A       |
| `openTime`       | Time it takes to open garage                      | `15`      |
| `closeTime`      | Time it takes to close garage                     | `15`      |
| `autoCloseTime`  | Amount of seconds before garage auto-closes again | `30`      |


### Example Configuration
```json
{
  "platform": "Shelly 1 Garage Door",
  "name": "Garage",
  "shellyIp": "192.168.0.100",
  "shellyUsername": "john",
  "shellyPassword": "d0e",
  "openTime": 10,
  "closeTime": 10,
  "autoCloseTime": 30
}
```
