import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { User } from './../../models/user';
import { CustomValidators } from './../../validators';

@Component({
  selector: 'app-signup-reactive-form',
  templateUrl: './signup-reactive-form.component.html',
  styleUrls: ['./signup-reactive-form.component.css']
})
export class SignupReactiveFormComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  private validationMessages = {
    email: {
      required: 'Please enter your email address.',
      pattern: 'Please enter a valid email address.',
      email: 'Please enter a valid email address.',
      asyncEmailInvalid:
        'This email already exists. Please enter other email address.'
    }
  };

  countries: Array<string> = ['Ukraine', 'Armenia', 'Belarus', 'Hungary', 'Kazakhstan', 'Poland', 'Russia'];
  user: User = new User();
  userForm: FormGroup;
  validationMessage: string;
  placeholder = {
    email: 'Email (required)',
    phone: 'Phone',
    confirmEmail: 'Confirm Email (required)',
  };

  constructor(
    private fb: FormBuilder
  ) { }

  get addresses(): FormArray {
    return <FormArray>this.userForm.get('addresses');
  }

  ngOnInit() {
    // this.createForm();
    // // this.setFormValues();
    // this.patchFormValues();
    this.buildForm();
    this.watchValueChanges();
  }

  private createForm() {
    this.userForm = new FormGroup({
      firstName: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3)],
        updateOn: 'blur'
      }),
      // It doesn't work!, will work in future. (Date: 20 Nov 2017)
      // firstName: this.fb.control('', { validators: [Validators.required, Validators.minLength(3)], updateOn: 'blur' }),
      lastName: new FormControl(),
      email: new FormControl(),
      phone: new FormControl(),
      notification: new FormControl('email'),
      serviceLevel: new FormControl('', {
        validators: [CustomValidators.serviceLevel],
        updateOn: 'blur'
      }),
      sendProducts: new FormControl(true)
    });
  }

  private buildForm() {
    this.userForm = this.fb.group({
      // firstName: ['', [Validators.required, Validators.minLength(3)]],
      // It works!
      firstName: new FormControl('', {
        validators: [Validators.required, Validators.minLength(3)],
        updateOn: 'blur'
      }),
      lastName: [
        { value: 'Zhyrytskyy', disabled: false },
        [Validators.required, Validators.maxLength(50)]
      ],
      // email: [
      //   '',
      //   [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+'), Validators.email],
      //   confirmEmail: ['', Validators.required],
      // ],
      emailGroup: this.fb.group({
        email: ['',
          [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+'), Validators.email]
        ],
        confirmEmail: ['', Validators.required],
      }, { validator: CustomValidators.emailMatcher }
    ),
      // serviceLevel: ['', CustomValidators.serviceLevel],
      // serviceLevel: ['', CustomValidators.serviceLevelRange(1, 3)],
      serviceLevel: [''],
      phone: '',
      notification: 'email',
      sendProducts: true,
      // addressType: 'home',
      // country: '',
      // city: '',
      // zip: '',
      // street1: '',
      // street2: ''

      // addresses: this.fb.group({
      //   addressType: 'home',
      //   country: '',
      //   city: '',
      //   zip: '',
      //   street1: '',
      //   street2: ''
      // })

      // addresses: this.buildAddress()

      addresses: this.fb.array([this.buildAddress()])
    });
  }

  save() {
    // Form model
    console.log(this.userForm);
    // Form value w/o disabled controls
    console.log(`Saved: ${JSON.stringify(this.userForm.value)}`);
    // Form value w/ disabled controls
    console.log(`Saved: ${JSON.stringify(this.userForm.getRawValue())}`);
  }

  private setFormValues() {
    this.userForm.setValue({
      firstName: 'Vitaliy',
      lastName: 'Zhyrytskyy',
      email: 'vitaliy_zhyrytskyy@ukr.net',
      sendProducts: false
    });
  }

  private patchFormValues() {
    this.userForm.patchValue({
      firstName: 'Vitaliy',
      lastName: 'Zhyrytskyy'
    });
  }

  // onSetNotification(notifyVia: string) {
  private setNotification(notifyVia: string) {
    const controls = new Map();
    controls.set('phoneControl', this.userForm.get('phone'));
    controls.set('emailGroup', this.userForm.get('emailGroup'));
    controls.set('emailControl', this.userForm.get('emailGroup.email'));
    controls.set(
      'confirmEmailControl',
      this.userForm.get('emailGroup.confirmEmail')
    );

    if (notifyVia === 'text') {
      controls.get('phoneControl').setValidators(Validators.required);
      controls.forEach(
        (control, index) =>
          index !== 'phoneControl' && control.clearValidators()
      );

      this.placeholder = {
        phone: 'Phone (required)',
        email: 'Email',
        confirmEmail: 'Confirm Email'
      };
    } else {
      controls
        .get('emailControl')
        .setValidators([
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+'),
          Validators.email
        ]);
      controls.get('confirmEmailControl').setValidators([Validators.required]);
      controls.get('emailGroup').setValidators([CustomValidators.emailMatcher]);
      controls.get('phoneControl').clearValidators();

      this.placeholder = {
        phone: 'Phone',
        email: 'Email (required)',
        confirmEmail: 'Confirm Email (required)'
      };
    }
    controls.forEach(control => control.updateValueAndValidity());
  }

  private watchValueChanges() {
    this.sub = this.userForm.get('notification').valueChanges
      // .subscribe(value => console.log(value));
      .subscribe(value => this.setNotification(value));
    const emailControl = this.userForm.get('emailGroup.email');
    const sub = emailControl.valueChanges
      .pipe(
        debounceTime(1000)
      )
      .subscribe(value =>
        this.setValidationMessage(emailControl, 'email')
      );
    this.sub.add(sub);
  }

  private setValidationMessage(c: AbstractControl, controlName: string) {
    this.validationMessage = '';

    if ((c.touched || c.dirty) && c.errors) {
      this.validationMessage = Object.keys(c.errors)
        .map(key => this.validationMessages[controlName][key])
        .join(' ');
    }
  }

  onBlur() {
    const emailControl = this.userForm.get('emailGroup.email');
    this.setValidationMessage(emailControl, 'email');
  }
  private buildAddress(): FormGroup {
    return this.fb.group({
      addressType: 'home',
      country: '',
      city: '',
      zip: '',
      street1: '',
      street2: ''
    });
  }

  onAddAddress(): void {
    this.addresses.push(this.buildAddress());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
