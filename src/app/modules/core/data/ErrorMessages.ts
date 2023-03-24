export namespace ErrorMessages {

    export enum PageName {
        LogIn,
        GeneralSettings,
        ShiftDefaults,
        PanelDefaults,
        Well,
        WellOutputMappings,
        Sources,
        Cards,
        Tools,
        Publishing
    }

    export class Errors {
        Id: string;
        Error: string;
        Message: string;

        static GetError(pageName: PageName, Id: string, errorType: string) {
            let err = new Errors();
            switch(pageName) {
                case PageName.LogIn:
                    err = Login.find(err => err.Id === Id && err.Error === errorType);
                    break;

                case PageName.GeneralSettings:
                    err = GeneralSettings.find(err => err.Id === Id && err.Error === errorType);
                    break;

                case PageName.Sources:
                    err = Sources.find(err => err.Id === Id && err.Error === errorType);
                    break;

                case PageName.Cards:
                    err = Cards.find(err => err.Id === Id && err.Error === errorType);
                    break;

                case PageName.Tools:
                    err = GaugeDetails.find(err => err.Id === Id && err.Error === errorType);
                    break;
            }
            return err;
        }
    }

    const Login: Errors[] = [
        { Id: "Name", Error: "required", Message: "Username is required." },
        { Id: 'Password', Error: 'required', Message: "Password is required" },
    ];

    const GeneralSettings: Errors[] = [
        { Id: "SerialNumber", Error: "required", Message: "Serial Number is required.\n" },
        { Id: 'SerialNumber', Error: 'maxlength', Message: "Serial Number must not exceed {0} characters.\n" },
        { Id: 'CustomerName', Error: 'required', Message: "Customer Name is required.\n"},
        { Id: 'CustomerName', Error: 'maxlength', Message: "Customer Name must not exceed {0} characters.\n"},
        { Id: 'FieldName', Error: 'required', Message: "Field Name is required.\n"},
        { Id: 'FieldName', Error: 'maxlength', Message: "Field Name must not exceed {0} characters.\n"},
        { Id: 'ToggleIntervalInSec', Error: 'minmax', Message: "Toggle Interval \n"},
    ];

    const Sources: Errors[] = [
        { Id: "TimeoutInMs", Error: "required", Message: "Modbus Timeout value is required.\n" },
        { Id: 'TimeoutInMs', Error: 'minmax', Message: "Modbus Timeout should be from {0}ms to {1}ms. \n" },
        { Id: 'PollRateInMs', Error: 'required', Message: "Poll Rate value is required.\n"},
        { Id: 'PollRateInMs', Error: 'minmax', Message: "Poll Rate range should be from {0}ms to {1}ms. \n"},
    ];

    const Cards: Errors[] = [
        { Id: "Description", Error: "required", Message: "Please enter a valid Card Name with alphanumeric characters." },
        { Id: "Description", Error: "pattern", Message: "Please enter a valid Card Name with alphanumeric characters." },
        { Id: "Description", Error: "maxlength", Message: "Card Name must not exceed {0} characters.\n" },
        { Id: "Description", Error: "duplicate", Message: "{0} already exists." },
        { Id: "CardAddress", Error: "required", Message: "Card Address is required." },
        { Id: "CardAddress", Error: "minmax", Message: "Card Address range should be from {0} to {1}." },
        { Id: "CardAddress", Error: "duplicate", Message: "Address {0} already exists." }
    ];

    const GaugeDetails: Errors[] = [
        { Id: "PressureCalibrationFile", Error: "required", Message: "Please select a valid CRF file.\n" },
        { Id: 'TemperatureCalibrationFile', Error: 'required', Message: "Please select a valid CRT file." },
        { Id: "SerialNumber", Error: "required", Message: "Serial Number is required.\n" },
        { Id: 'SerialNumber', Error: 'maxlength', Message: "Serial Number must not exceed {0} characters.\n" },
        { Id: 'GaugeDetails', Error: 'required', Message: 'Invalid Gauge data - Please add Tool Connection details.' }
    ];
}