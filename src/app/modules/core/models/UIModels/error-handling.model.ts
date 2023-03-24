import { ErrorHandlingUIModel } from '../webModels/ErrorHandlingUI.model';
import { ErrorNotifierModel } from './error-notifier-model';

export class ErrorHandlingModel extends ErrorHandlingUIModel {
    error?: ErrorNotifierModel;
}
