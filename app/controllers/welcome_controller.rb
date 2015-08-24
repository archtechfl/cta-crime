class WelcomeController < ApplicationController

    def index
        require 'soda/client'
        require 'time'
        client = SODA::Client.new({:domain => 'data.cityofchicago.org', :app_token => Rails.application.secrets.soda_app_token})
        response = client.get("qnmj-8ku6", {"$limit" => 10000, "$q" => "CTA"})
        crimes_filtered = filter_cta_entries(response)
        @data = crimes_filtered
    end

    def filter_cta_entries(dataset)
        public_crimes = Array.new
        dataset.each do |crime|
            location = crime.location_description.downcase
            if  location.include?("platform") || 
                location.include?("train") || 
                location.include?("bus") || 
                location.include?("stop")
                    public_crimes.push(crime)
            end
        end
        return public_crimes
    end

end
