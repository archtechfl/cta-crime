class WelcomeController < ApplicationController

    def index
        @data = CrimeEntry.getCrimeResults()
        @tally = CrimeEntry.get_tally()
    end

end
