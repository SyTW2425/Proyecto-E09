import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch(
    (err) => {
      if (err.message.includes('document is not defined')) {
        return;
      }
      console.error(err);
    }
  );