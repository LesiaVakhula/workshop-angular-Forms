import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceLevelDirective } from '.';
import { AsyncEmailValidatorDirective } from './async-email-validator.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ServiceLevelDirective, AsyncEmailValidatorDirective],
  exports: [ServiceLevelDirective, AsyncEmailValidatorDirective]
})
export class ValidatorsModule { }
