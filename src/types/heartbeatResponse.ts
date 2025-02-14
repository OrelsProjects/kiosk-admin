export interface Auth {
  user: {
    token: string;
    username: string;
    role: string;
    nid: number;
  };
  preview: boolean;
  deviceFingerprint: string;
}


export interface Property {
  id: string;
  listing_name: string;
  is_active: boolean;
  section_C_description: string;
  section_B_description: string;
  listing_state: string;
  listing_owner: string;
  alert_sms: string;
  location_longitude?: string;
  checkin_instructions: string;
  photos_welcome: string;
  section_C_name: string;
  important_info: string;
  section_A_description: string;
  welcome_message: string;
  checkin_survey?: string;
  host_name: string;
  wifi_password: string;
  ical_source: string;
  photos_screensaver: string[];
  checkout_time: CheckoutTime;
  listing_city: string;
  checkin_instructions_title: string;
  host_photo: string;
  section_B_name: string;
  thank_you_message: string;
  listing_zip: string;
  checkout_instructions: string;
  alert_email: string;
  checkout_survey?: string;
  checkout_instructions_title: string;
  location_latitude: string;
  wifi_network: string;
  listing_address_1: string;
  listing_address_2?: string;
  listing_country?: string;
  checkout_message: string;
  checkin_time: CheckInTime;
  event_ids: Event[];
  wifi_qr_code_svg: string;
  section_A_name: string;
  maps_api_json?: string;
}

interface CheckInTime {
  check_in_time_display: string;
  check_in_time_choice: string;
  id: string;
}

interface CheckoutTime {
  checkout_time_display: string;
  checkout_time_choice: string;
  id: string;
}

interface Event {
  name: string;
  start?: number;
  end?: number;
  id: string;
}

export interface Reservation {
  name: string;
  listing_id: { id: string; listing_name: string };
  date_start: string;
  date_end: string;
  reservationCode: string;
}

export interface System {
  state: string;
  timezone: string;
}
