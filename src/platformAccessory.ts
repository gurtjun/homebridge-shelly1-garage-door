import { Service, PlatformAccessory } from 'homebridge';

import { GarageDoorOpenerPlatform } from './platform';
import fetch from 'node-fetch';
import {Headers} from 'node-fetch';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class GarageDoorOpenerPlatformAccessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private states = {
    CurrentDoorState: this.platform.Characteristic.TargetDoorState.CLOSED,
    TargetDoorState: this.platform.Characteristic.TargetDoorState.CLOSED,
    ObstructionDetected: false,
  };

  constructor(
      private readonly platform: GarageDoorOpenerPlatform,
      private readonly accessory: PlatformAccessory,
  ) {

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Shelly')
      .setCharacteristic(this.platform.Characteristic.Model, 'Shelly 1')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.uuid);

    // get the GarageDoorOpener service if it exists, otherwise create a new GarageDoorOpener service
    // you can create multiple services for each accessory
    this.service = this.accessory.getService(this.platform.Service.GarageDoorOpener)
        || this.accessory.addService(this.platform.Service.GarageDoorOpener);

    // set the service name, this is what is displayed as the default name on the Home app
    // in this example we are using the name we stored in the `accessory.context` in the `discoverDevices` method.
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.displayName);

    // set the service default value
    this.service.setCharacteristic(this.platform.Characteristic.CurrentDoorState, this.platform.Characteristic.CurrentDoorState.CLOSED);

    // each service must implement at-minimum the "required characteristics" for the given service type
    // see https://developers.homebridge.io/#/service/GarageDoorOpener

    // register handlers for the CurrentDoorState Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.CurrentDoorState)
      .onGet(this.handleCurrentDoorStateGet.bind(this)); // GET - bind to the `handleCurrentDoorStateGet` method below

    // register handlers for the TargetDoorState Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.TargetDoorState)
      .onGet(this.handleTargetDoorStateGet.bind(this)) // GET - bind to the `handleTargetDoorStateGet` method below
      .onSet(this.handleTargetDoorStateSet.bind(this)); // SET - bind to the `handleTargetDoorStateSet` method below

    // register handlers for the ObstructionDetected Characteristic
    this.service.getCharacteristic(this.platform.Characteristic.ObstructionDetected)
      .onGet(this.handleObstructionDetectedGet.bind(this)); // GET - bind to the `handleObstructionDetectedGet` method below
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  handleCurrentDoorStateGet() {
    this.platform.log.debug('Triggered GET CurrentDoorState');
    const currentDoorState = this.states.CurrentDoorState;

    // set this to a valid value for CurrentDoorState
    return currentDoorState;
  }

  handleTargetDoorStateGet() {
    this.platform.log.debug('Triggered GET TargetDoorState');
    const targetDoorState = this.states.TargetDoorState;
    // set this to a valid value for TargetDoorState
    return targetDoorState;
  }

  handleObstructionDetectedGet() {
    this.platform.log.debug('Triggered GET ObstructionDetected');
    const obstructionDeteced = this.states.ObstructionDetected;

    return obstructionDeteced;
  }

  /**
   * Handle "SET" requests from HomeKit
   * These are sent when the user changes the state of an accessory, for example, changing the Brightness
   */
  async handleTargetDoorStateSet(value) {
    this.platform.log.debug('Triggered SET TargetDoorState:', value);

    if (value === this.platform.Characteristic.TargetDoorState.CLOSED) {
      this.platform.log.debug('Closing Garage Door in %s seconds', this.platform.config.closeTime * 1000);
      setTimeout(() => {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, value);
      }, this.platform.config.closeTime * 1000);
    }

    if (value === this.platform.Characteristic.TargetDoorState.OPEN) {
      const {shellyIp, shellyUsername, shellyPassword} = this.platform.config;
      if (shellyIp !== null) {
        const headers = new Headers();
        if (shellyUsername !== null && shellyPassword !== null) {
          headers.set('Authorization', 'Basic ' + Buffer.from(shellyUsername + ':' + shellyPassword).toString('base64'));
        }

        await fetch(`http://${shellyIp}/relay/0?turn=on`, {
          method: 'GET',
          headers,
          timeout: 3000,
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to call shelly 1 at ${shellyIp}`);
          }
        }).catch(error => {
          this.platform.log.error(error);
          throw new this.platform.api.hap.HapStatusError(this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE);
        });

      }

      this.platform.log.debug('Opening Garage Door in %s seconds', this.platform.config.openTime * 1000);
      setTimeout(() => {
        this.service.updateCharacteristic(this.platform.Characteristic.CurrentDoorState, value);
      }, this.platform.config.openTime * 1000);

      // Auto-close
      this.platform.log.debug('Auto-closing Garage Door in %s seconds', this.platform.config.autoCloseTime * 1000);
      setTimeout(() => {
        this.service.setCharacteristic(this.platform.Characteristic.TargetDoorState,
          this.platform.Characteristic.TargetDoorState.CLOSED);
      }, this.platform.config.autoCloseTime * 1000);
    }
  }

}
